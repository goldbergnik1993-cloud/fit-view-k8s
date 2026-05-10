import os
import shutil
import uuid
import json
import random
from typing import Optional

from fastapi import Request, HTTPException, status, UploadFile, BackgroundTasks
from redis import Redis
from sqlalchemy import select, desc, asc, func, or_, String, cast
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.logging_config import logger
from database.models import UserModel, UserProfileModel
from database.models.catalog import (
    ItemsModel,
    SizeChartModel,
    FavoritesModel,
    ItemCategoryEnum,
    BrandsModel,
    ItemMeasurementsModel,
)
from database.models.events import FitResultEnum
from database.models.user import GenderEnum
from schemas.catalog import (
    ItemsListSchema,
    ItemListItemSchema,
    ItemDetailSchema,
    FittingRoomRequestSchema,
    FittingRoomResponseSchema,
    VisualMarkersSchema,
    FitAnalysisSchema,
    UserBodySchema,
    ItemCreateSchema,
    ItemUpdateSchema,
)
from services.telemetry import save_fitting_room_telemetry
from utils.service_helpers import pagination_helper

REQUIRED_FIELDS_BY_CATEGORY = {
    ItemCategoryEnum.PANTS: [
        "height_cm",
        "waist_length_cm",
        "hips_length_cm",
        "leg_length_cm",
    ],
    ItemCategoryEnum.SKIRT: ["height_cm", "waist_length_cm", "hips_length_cm"],
    ItemCategoryEnum.DRESS: [
        "height_cm",
        "breast_length_cm",
        "waist_length_cm",
        "hips_length_cm",
    ],
    ItemCategoryEnum.T_SHIRT: ["height_cm", "shoulders_length_cm", "breast_length_cm"],
    ItemCategoryEnum.SHIRT: ["height_cm", "shoulders_length_cm", "breast_length_cm"],
    ItemCategoryEnum.BLOUSE: [
        "height_cm",
        "shoulders_length_cm",
        "breast_length_cm",
        "waist_length_cm",
    ],
}

FIT_ITEM_TTL_SECONDS = 600
FIT_PROFILE_TTL_SECONDS = 180


def _fit_item_cache_key(item_id: int) -> str:
    return f"fit:item:{item_id}"


def _fit_profile_cache_key(user_id: int) -> str:
    return f"fit:profile:{user_id}"


async def _invalidate_fit_item_cache(redis_client: Redis, item_id: int) -> None:
    await redis_client.delete(_fit_item_cache_key(item_id))


async def get_items_list(
    request: Request,
    db: AsyncSession,
    filters: dict,
    page: int,
    per_page: int,
    sort_by: str,
    user_id: int | None = None,
    only_favorites: bool = False,
):
    stmt = select(ItemsModel)
    if only_favorites and user_id:
        stmt = stmt.join(ItemsModel.favorites).where(FavoritesModel.user_id == user_id)
    if filters.get("category"):
        stmt = stmt.where(ItemsModel.category == filters["category"])
    if filters.get("name"):
        stmt = stmt.where(ItemsModel.name.ilike(f"%{filters['name']}%"))
    if filters.get("brands"):
        stmt = stmt.where(ItemsModel.brand_id.in_(filters["brands"]))

    if filters.get("size"):
        stmt = stmt.join(ItemsModel.size_charts).where(
            SizeChartModel.size_label.ilike(f"%{filters['size']}%")
        )
    if filters.get("gender"):
        stmt = stmt.where(ItemsModel.gender == filters["gender"])

    if filters.get("min_price"):
        stmt = stmt.where(ItemsModel.price >= filters["min_price"])
    if filters.get("max_price"):
        stmt = stmt.where(ItemsModel.price <= filters["max_price"])
    stmt = stmt.group_by(ItemsModel.id)

    if sort_by == "popular":
        if not (only_favorites and user_id):
            stmt = stmt.outerjoin(ItemsModel.favorites)
        stmt = stmt.order_by(desc(func.count(FavoritesModel.id)))
    elif sort_by == "new":
        stmt = stmt.order_by(desc(ItemsModel.created_at))
    elif sort_by == "price_asc":
        stmt = stmt.order_by(asc(ItemsModel.price))
    elif sort_by == "price_desc":
        stmt = stmt.order_by(desc(ItemsModel.price))
    else:
        stmt = stmt.order_by(desc(ItemsModel.created_at))
    stmt = stmt.options(
        selectinload(ItemsModel.brand),
        selectinload(ItemsModel.size_charts),
        selectinload(ItemsModel.measurements),
        selectinload(ItemsModel.favorites),
    )

    result = await pagination_helper(
        request=request, db=db, stmt=stmt, page=page, per_page=per_page
    )

    items_response = []
    for piece in result["items"]:
        is_favorite = only_favorites or (
            bool(user_id) and any(fav.user_id == user_id for fav in piece.favorites)
        )
        items_response.append(
            ItemListItemSchema(
                id=piece.id,
                name=piece.name,
                brand=piece.brand,
                category=piece.category,
                gender=piece.gender,
                image_url=piece.image_url,
                price=piece.price,
                available_sizes=[size.size_label for size in piece.size_charts],
                available_measurements=[
                    measurement.size_label for measurement in piece.measurements
                ],
                is_favorite=is_favorite,
            )
        )

    return ItemsListSchema(
        items=items_response,
        total_items=result["total_items"],
        total_pages=result["total_pages"],
        prev_page=result["prev_page"],
        next_page=result["next_page"],
    )


async def item_view(item_id: int, db: AsyncSession, user_id: int | None = None):
    item_stmt = (
        select(ItemsModel)
        .where(ItemsModel.id == item_id)
        .options(
            selectinload(ItemsModel.size_charts),
            selectinload(ItemsModel.measurements),
            selectinload(ItemsModel.brand),
            selectinload(ItemsModel.favorites),
        )
    )
    db_item = await db.scalar(item_stmt)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item is not found",
        )
    db_item.is_favorite = False  # type: ignore
    if user_id:
        db_item.is_favorite = any(  # type: ignore[attr-defined]
            fav.user_id == user_id for fav in db_item.favorites
        )

    db_item.mandatory_fields = REQUIRED_FIELDS_BY_CATEGORY.get(  # type: ignore[attr-defined]
        db_item.category, ["height_cm"]
    )

    return ItemDetailSchema.model_validate(db_item)


async def toggle_favorite(db: AsyncSession, user_id: int, item_id: int) -> dict:
    item_exists = await db.scalar(select(ItemsModel.id).where(ItemsModel.id == item_id))
    if not item_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )

    stmt = select(FavoritesModel).where(
        FavoritesModel.user_id == user_id, FavoritesModel.item_id == item_id
    )
    favorite = await db.scalar(stmt)

    if favorite:
        await db.delete(favorite)
        await db.commit()
        return {"message": "Item removed from favorites", "is_favorite": False}
    new_favorite = FavoritesModel(
        user_id=user_id, item_id=item_id, used_fitview=False, converted=False
    )
    db.add(new_favorite)
    await db.commit()
    return {"message": "Item added to favorites", "is_favorite": True}


async def fitting_room(
    item_id: int,
    payload: FittingRoomRequestSchema,
    db: AsyncSession,
    redis_client: Redis,
    background_tasks: BackgroundTasks,
    user: UserModel | None = None,
) -> FittingRoomResponseSchema:
    cached_item_str = await redis_client.get(_fit_item_cache_key(item_id))
    item_cache_hit = bool(cached_item_str)
    if item_cache_hit:
        item_data = json.loads(cached_item_str)
    else:
        item_stmt = (
            select(ItemsModel)
            .where(ItemsModel.id == item_id)
            .options(
                selectinload(ItemsModel.size_charts),
                selectinload(ItemsModel.measurements),
            )
        )
        item_db = await db.scalar(item_stmt)
        if not item_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
            )
        item_data = {
            "id": item_db.id,
            "category": item_db.category.value,
            "gender": item_db.gender.value,
            "reference_point": item_db.reference_point.value,
            "ref_coefficient": item_db.ref_coefficient,
            "size_charts": [
                {
                    "size_label": size.size_label,
                    "hips_min_cm": size.hips_min_cm,
                    "hips_max_cm": size.hips_max_cm,
                    "waist_min_cm": size.waist_min_cm,
                    "waist_max_cm": size.waist_max_cm,
                    "breast_min_cm": size.breast_min_cm,
                    "breast_max_cm": size.breast_max_cm,
                    "shoulders_min_cm": size.shoulders_min_cm,
                    "shoulders_max_cm": size.shoulders_max_cm,
                }
                for size in item_db.size_charts
            ],
            "measurements": [
                {
                    "size_label": measurement.size_label,
                    "total_length_cm": measurement.total_length_cm,
                    "inseam_cm": measurement.inseam_cm,
                }
                for measurement in item_db.measurements
            ],
        }
        await redis_client.setex(
            _fit_item_cache_key(item_id),
            FIT_ITEM_TTL_SECONDS,
            json.dumps(item_data),
        )
    profile_data = None
    profile_cache_hit = False
    if user:
        cached_profile_str = await redis_client.get(_fit_profile_cache_key(user.id))
        profile_cache_hit = bool(cached_profile_str)
        if profile_cache_hit:
            profile_data = json.loads(cached_profile_str)
        else:
            profile_stmt = select(UserProfileModel).where(
                UserProfileModel.user_id == user.id
            )
            profile_db = await db.scalar(profile_stmt)
            profile_data = {
                "gender": profile_db.gender.value if profile_db else "female",
                "height_cm": profile_db.height_cm if profile_db else None,
                "shoulders_length_cm": profile_db.shoulders_length_cm
                if profile_db
                else None,
                "breast_length_cm": profile_db.breast_length_cm if profile_db else None,
                "waist_length_cm": profile_db.waist_length_cm if profile_db else None,
                "hips_length_cm": profile_db.hips_length_cm if profile_db else None,
                "leg_length_cm": profile_db.leg_length_cm if profile_db else None,
            }
            await redis_client.setex(
                _fit_profile_cache_key(user.id),
                FIT_PROFILE_TTL_SECONDS,
                json.dumps(profile_data),
            )

    active_body = {
        "gender": profile_data["gender"] if profile_data else GenderEnum.FEMALE,
        "height_cm": payload.height_cm or (profile_data and profile_data["height_cm"]),
        "shoulders_length_cm": payload.shoulders_length_cm
        or (profile_data and profile_data["shoulders_length_cm"]),
        "breast_length_cm": payload.breast_length_cm
        or (profile_data and profile_data["breast_length_cm"]),
        "waist_length_cm": payload.waist_length_cm or (profile_data and profile_data["waist_length_cm"]),
        "hips_length_cm": payload.hips_length_cm or (profile_data and profile_data["hips_length_cm"]),
        "leg_length_cm": payload.leg_length_cm or (profile_data and profile_data["leg_length_cm"]),
    }
    item_category = ItemCategoryEnum(item_data["category"])
    required_fields = REQUIRED_FIELDS_BY_CATEGORY.get(item_category, ["height_cm"])
    missing_fields = [field for field in required_fields if active_body[field] is None]

    if missing_fields:
        readable_missing = [
            field.replace("_length_cm", "").replace("_cm", "")
            for field in missing_fields
        ]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required measurements for this item: "
            f"{', '.join(readable_missing)}.",
        )
    measurement = next(
        (
            m
            for m in item_data["measurements"]
            if m["size_label"].upper() == payload.size_label.upper()
        ),
        None,
    )
    size_chart = next(
        (
            s
            for s in item_data["size_charts"]
            if s["size_label"].upper() == payload.size_label.upper()
        ),
        None,
    )

    if not measurement or not size_chart:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Size '{payload.size_label}' is not available for this item.",
        )

    user_height = float(active_body["height_cm"])  # type: ignore

    if item_category == ItemCategoryEnum.PANTS:
        h_end_cm = item_data["ref_coefficient"] * user_height - measurement["inseam_cm"]
    else:
        h_end_cm = (
            item_data["ref_coefficient"] * user_height - measurement["total_length_cm"]
        )
    line_position_pct = (h_end_cm / user_height) * 100

    def does_it_fit(
        user_val: int | None, min_val: float | None = None, max_val: float | None = None
    ) -> FitResultEnum | None:
        if user_val is None or min_val is None or max_val is None:
            return None
        if user_val > max_val:
            return FitResultEnum.TIGHT
        if user_val < min_val:
            return FitResultEnum.LOOSE
        return FitResultEnum.PERFECT

    hips_fit = does_it_fit(
        user_val=active_body["hips_length_cm"],  # type: ignore
        min_val=size_chart["hips_min_cm"],
        max_val=size_chart["hips_max_cm"],
    ) if "hips_length_cm" in required_fields else None
    waist_fit = does_it_fit(
        user_val=active_body["waist_length_cm"],  # type: ignore
        min_val=size_chart["waist_min_cm"],
        max_val=size_chart["waist_max_cm"],
    ) if "waist_length_cm" in required_fields else None
    breast_fit = does_it_fit(
        user_val=active_body["breast_length_cm"],  # type: ignore
        min_val=size_chart["breast_min_cm"],
        max_val=size_chart["breast_max_cm"],
    ) if "breast_length_cm" in required_fields else None
    shoulders_fit = does_it_fit(
        user_val=active_body["shoulders_length_cm"],  # type: ignore
        min_val=size_chart["shoulders_min_cm"],
        max_val=size_chart["shoulders_max_cm"],
    ) if "shoulders_length_cm" in required_fields else None
    result = FittingRoomResponseSchema(
        item_id=item_id,
        size_label=size_chart["size_label"],
        gender=item_data["gender"],
        visual_markers=VisualMarkersSchema(
            h_end_cm=round(h_end_cm, 2),
            line_position_pct=round(line_position_pct, 2),
            reference_point=item_data["reference_point"],
        ),
        fit_analysis=FitAnalysisSchema(
            hips_fit=hips_fit,
            waist_fit=waist_fit,
            breast_fit=breast_fit,
            shoulders_fit=shoulders_fit,
        ),
        user_body=UserBodySchema(**active_body),  # type: ignore
    )

    background_tasks.add_task(
        save_fitting_room_telemetry,
        user_id=user.id if user else None,
        item_id=item_id,
        fit_data={
            "height_cm": user_height,
            "h_end_cm": h_end_cm,
            "shoulders_fit": shoulders_fit,
            "breast_fit": breast_fit,
            "waist_fit": waist_fit,
            "hips_fit": hips_fit,
        },
        ab_group=user.ab_group if user else random.choice(["A", "B"]),
    )

    logger.info(
        "fitting_room_result",
        user_id=user.id if user else None,
        item_cache_hit=item_cache_hit,
        profile_cache_hit=profile_cache_hit,
        body_fields_used=[
            key for key, value in active_body.items() if value is not None
        ],
        item_id=item_id,
        size_label=size_chart["size_label"],
        fit_analysis={
            "shoulders": shoulders_fit,
            "breast": breast_fit,
            "waist": waist_fit,
            "hips": hips_fit,
        },
        visual_markers={
            "h_end": round(h_end_cm, 2),
            "line_position_pct": round(line_position_pct, 2),
            "reference_point": item_data["reference_point"],
        },
    )

    return result


# CREATE / UPDATE / DELETE
async def item_create(payload: ItemCreateSchema, db: AsyncSession) -> ItemsModel:
    try:
        brand_stmt = select(BrandsModel).where(
            func.lower(BrandsModel.name) == payload.brand.lower()
        )
        brand_db = await db.scalar(brand_stmt)

        if not brand_db:
            brand_db = BrandsModel(name=payload.brand.title())
            db.add(brand_db)
            await db.flush()

        existing_item_stmt = select(ItemsModel.id).where(
            ItemsModel.name == payload.name,
            ItemsModel.brand_id == brand_db.id,
            ItemsModel.category == payload.category,
        )

        if await db.scalar(existing_item_stmt):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An item with this name, brand, and category already exists.",
            )

        new_item = ItemsModel(
            name=payload.name,
            brand_id=brand_db.id,
            category=payload.category,
            gender=payload.gender,
            image_url=str(payload.image_url),
            price=payload.price,
            description=payload.description,
            reference_point=payload.reference_point,
            ref_coefficient=payload.ref_coefficient,
        )

        if payload.size_charts:
            new_item.size_charts = [
                SizeChartModel(**chart.model_dump()) for chart in payload.size_charts
            ]

        if payload.measurements:
            new_item.measurements = [
                ItemMeasurementsModel(**measurement.model_dump())
                for measurement in payload.measurements
            ]

        db.add(new_item)
        await db.commit()

        stmt = (
            select(ItemsModel)
            .where(ItemsModel.id == new_item.id)
            .options(
                selectinload(ItemsModel.brand),
                selectinload(ItemsModel.size_charts),
                selectinload(ItemsModel.measurements),
                selectinload(ItemsModel.favorites),
            )
        )
        return await db.scalar(stmt)  # type: ignore

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create item and associated records. Database rolled back.",
        )


async def item_update(
    payload: ItemUpdateSchema,
    item_id: int,
    db: AsyncSession,
    redis_client: Redis,
):
    item_stmt = select(ItemsModel).where(ItemsModel.id == item_id)
    item_db = await db.scalar(item_stmt)
    if not item_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} not found.",
        )
    update_data = payload.model_dump(exclude_unset=True, mode="json")

    if "brand" in update_data:
        brand_name = update_data.pop("brand")
        brand_stmt = select(BrandsModel).where(
            func.lower(BrandsModel.name) == brand_name.lower()
        )
        brand_db = await db.scalar(brand_stmt)

        if not brand_db:
            brand_db = BrandsModel(name=brand_name.title())
            db.add(brand_db)
            await db.flush()
        item_db.brand_id = brand_db.id

    if "size_charts" in update_data:
        incoming_charts = update_data.pop("size_charts")

        existing_charts = {chart.size_label: chart for chart in item_db.size_charts}

        for chart_data in incoming_charts:
            label = chart_data["size_label"]
            if label in existing_charts:
                for key, value in chart_data.items():
                    setattr(existing_charts[label], key, value)
            else:
                new_chart = SizeChartModel(item_id=item_db.id, **chart_data)
                db.add(new_chart)
    if "measurements" in update_data:
        incoming_measurements = update_data.pop("measurements")
        existing_measurements = {m.size_label: m for m in item_db.measurements}

        for meas_data in incoming_measurements:
            label = meas_data["size_label"]
            if label in existing_measurements:
                for key, value in meas_data.items():
                    setattr(existing_measurements[label], key, value)
            else:
                new_meas = ItemMeasurementsModel(item_id=item_db.id, **meas_data)
                db.add(new_meas)
    for field, value in update_data.items():
        if field == "image_url" and value is not None:
            value = str(value)
        setattr(item_db, field, value)

    try:
        await db.commit()
        await _invalidate_fit_item_cache(redis_client=redis_client, item_id=item_id)
        stmt = (
            select(ItemsModel)
            .where(ItemsModel.id == item_id)
            .options(
                selectinload(ItemsModel.brand),
                selectinload(ItemsModel.size_charts),
                selectinload(ItemsModel.measurements),
                selectinload(ItemsModel.favorites),
            )
        )
        return await db.scalar(stmt)

    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update item ID {item_id}. Database rolled back.",
        )


async def item_delete(item_id: int, db: AsyncSession, redis_client: Redis) -> dict:
    item_stmt = select(ItemsModel).where(ItemsModel.id == item_id)
    item_db = await db.scalar(item_stmt)

    if not item_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} not found.",
        )

    image_url = item_db.image_url
    fitting_image_url = item_db.fitting_image_url

    try:
        await db.delete(item_db)
        await db.commit()
        await _invalidate_fit_item_cache(redis_client=redis_client, item_id=item_id)
        
        for url in filter(None, [image_url, fitting_image_url]):
            filename = url.split("/")[-1]
            file_path = os.path.join("static", "items_images", filename)
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError as e:
                    logger.warning(
                        "item_image_delete_failed",
                        file_path=file_path,
                        error=str(e),
                    )
                    
        return {"message": f"Item with ID {item_id} has been successfully deleted."}

    except SQLAlchemyError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while attempting to delete item ID "
            f"{item_id}. Database rolled back. Error: {e}",
        )


async def size_chart_delete(
    item_id: int,
    size_chart_id: int,
    db: AsyncSession,
    redis_client: Redis,
):
    stmt = select(SizeChartModel).where(
        SizeChartModel.id == size_chart_id, SizeChartModel.item_id == item_id
    )
    size_chart_db = await db.scalar(stmt)
    if not size_chart_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Size chart with ID {size_chart_id} not found.",
        )
    try:
        await db.delete(size_chart_db)
        await db.commit()
        await _invalidate_fit_item_cache(redis_client=redis_client, item_id=item_id)
        return {
            "message": f"Size chart with ID {size_chart_id} has been "
            f"successfully deleted."
        }
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while attempting to delete the size "
            f"chart ID {size_chart_id}. Database rolled back.",
        )


async def measurement_delete(
    item_id: int,
    measurement_id: int,
    db: AsyncSession,
    redis_client: Redis,
):
    stmt = select(ItemMeasurementsModel).where(
        ItemMeasurementsModel.id == measurement_id,
        ItemMeasurementsModel.item_id == item_id,
    )
    measurement_db = await db.scalar(stmt)
    if not measurement_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Size chart with ID {measurement_id} not found.",
        )
    try:
        await db.delete(measurement_db)
        await db.commit()
        await _invalidate_fit_item_cache(redis_client=redis_client, item_id=item_id)
        return {
            "message": f"Item measurement with ID {measurement_id} has been "
            f"successfully deleted."
        }
    except SQLAlchemyError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while attempting to delete item "
            f"measurement ID {measurement_id}. Database rolled back.",
        )


async def upload_item_image_service(file: UploadFile) -> str:
    if not file.content_type or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file data."
        )
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File provided is not an image.",
        )

    extension = file.filename.split(".")[-1]
    filename = f"item_{uuid.uuid4()}.{extension}"

    file_path = os.path.join("static", "items_images", filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return f"/static/items_images/{filename}"


async def get_search_autocomplete(query: str, db: AsyncSession) -> list[ItemsModel]:
    if not query or len(query) < 2:
        return []

    stmt = (
        select(ItemsModel)
        .where(
            or_(
                ItemsModel.name.ilike(f"%{query}%"),
                cast(ItemsModel.category, String).ilike(f"%{query}%"),
            )
        )
        .limit(5)
    )
    result = await db.scalars(stmt)
    return list(result)


async def get_user_recommendations(
    user_id: Optional[int], db: AsyncSession
) -> list[ItemsModel]:
    base_stmt = select(ItemsModel).options(
        selectinload(ItemsModel.brand),
        selectinload(ItemsModel.size_charts),
        selectinload(ItemsModel.measurements),
        selectinload(ItemsModel.favorites),
    )
    profile = None
    if user_id:
        profile_stmt = select(UserProfileModel).where(
            UserProfileModel.user_id == user_id
        )
        profile = await db.scalar(profile_stmt)

    if profile and profile.gender:
        stmt = (
            base_stmt.where(
                or_(ItemsModel.gender == profile.gender, ItemsModel.gender == "female")
            )
            .order_by(func.random())
            .limit(10)
        )

    else:
        stmt = base_stmt.order_by(desc(ItemsModel.id)).limit(10)

    result = await db.scalars(stmt)
    items = list(result)

    for item in items:
        if user_id:
            item.is_favorite = any(  # type: ignore[attr-defined]
                fav.user_id == user_id for fav in item.favorites
            )
        else:
            item.is_favorite = False  # type: ignore[attr-defined]

        item.available_sizes = [  # type: ignore[attr-defined]
            size.size_label for size in item.size_charts
        ]
        item.available_measurements = [  # type: ignore[attr-defined]
            m.size_label for m in item.measurements
        ]

    return items
