from random import choice

from fastapi import Request, HTTPException, status
from sqlalchemy import select, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.models import UserModel, UserProfileModel, FitviewEventsModel
from database.models.catalog import (
    ItemsModel,
    SizeChartModel,
    FavoritesModel,
    ItemCategoryEnum
)
from schemas.catalog import (
    ItemsListSchema,
    ItemListItemSchema,
    ItemDetailSchema,
    FittingRoomRequestSchema,
    FittingRoomResponseSchema,
    VisualMarkersSchema,
    FitAnalysisSchema,
    UserBodySchema
)
from utils.service_helpers import pagination_helper


async def get_items_list(
        request: Request,
        db: AsyncSession,
        filters: dict,
        page: int,
        per_page: int,
        sort_by: str,
        user_id: int | None = None,
        only_favorites: bool = False
):
    stmt = select(ItemsModel)
    if only_favorites and user_id:
        stmt = stmt.join(ItemsModel.favorites).where(
            FavoritesModel.user_id == user_id
        )
    if filters.get("category"):
        stmt = stmt.where(ItemsModel.category == filters["category"])
    if filters.get("name"):
        stmt = stmt.where(
            ItemsModel.name.ilike(f"%{filters['name']}%")
        )
    if filters.get("brands"):
        stmt = stmt.where(ItemsModel.brand_id.in_(filters["brands"]))

    if filters.get("size"):
        stmt = stmt.join(ItemsModel.size_charts).where(
            SizeChartModel.size_label.ilike(f"%{filters['size']}%")
        )

    if filters.get("min_price"):
        stmt = stmt.where(ItemsModel.price >= filters["min_price"])
    if filters.get("max_price"):
        stmt = stmt.where(ItemsModel.price <= filters["max_price"])
    stmt = stmt.distinct()
    sort_options = {
        "price_asc": asc(ItemsModel.price),
        "price_desc": desc(ItemsModel.price),
    }

    stmt = stmt.order_by(
        sort_options.get(sort_by, asc(ItemsModel.price)))
    stmt = stmt.options(
        selectinload(ItemsModel.brand),
        selectinload(ItemsModel.size_charts),
        selectinload(ItemsModel.measurements),
        selectinload(ItemsModel.favorites)
    )

    result = await pagination_helper(
        request=request, db=db, stmt=stmt, page=page, per_page=per_page
    )

    items_response = []
    for piece in result["items"]:
        is_favorite = False
        if only_favorites:
            is_favorite = True
        elif user_id:
            is_favorite = any(
                fav.user_id == user_id for fav in piece.favorites)
        items_response.append(
            ItemListItemSchema(
                id=piece.id,
                name=piece.name,
                brand=piece.brand,
                category=piece.category,
                image_url=piece.image_url,
                price=piece.price,
                available_sizes=[
                    size.size_label for size in piece.size_charts
                ],
                available_measurements=[
                    measurement.size_label
                    for measurement in piece.measurements
                ],
                is_favorite=is_favorite
            )
        )

    return ItemsListSchema(
        items=items_response,
        total_items=result["total_items"],
        total_pages=result["total_pages"],
        prev_page=result["prev_page"],
        next_page=result["next_page"]
    )


async def item_view(
        item_id: int, db: AsyncSession, user_id: int | None = None
):
    item_stmt = select(ItemsModel).where(ItemsModel.id == item_id).options(
        selectinload(ItemsModel.size_charts),
        selectinload(ItemsModel.measurements),
        selectinload(ItemsModel.brand),
        selectinload(ItemsModel.favorites)
    )
    db_item = await db.scalar(item_stmt)
    if not db_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item is not found",
        )
    db_item.is_favorite = False
    if user_id:
        db_item.is_favorite = any(
            fav.user_id == user_id for fav in db_item.favorites)

    return ItemDetailSchema.model_validate(db_item)


async def toggle_favorite(
    db: AsyncSession, user_id: int, item_id: int
) -> dict:
    item_exists = await db.scalar(
        select(ItemsModel.id).where(ItemsModel.id == item_id)
    )
    if not item_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )

    stmt = select(FavoritesModel).where(
        FavoritesModel.user_id == user_id,
        FavoritesModel.item_id == item_id
    )
    favorite = await db.scalar(stmt)

    if favorite:
        await db.delete(favorite)
        await db.commit()
        return {
            "message": "Item removed from favorites",
            "is_favorite": False
        }
    new_favorite = FavoritesModel(
        user_id=user_id,
        item_id=item_id,
        used_fitview=False,
        converted=False
    )
    db.add(new_favorite)
    await db.commit()
    return {
        "message": "Item added to favorites",
        "is_favorite": True
    }


async def fitting_room(
        user: UserModel,
        item_id: int,
        payload: FittingRoomRequestSchema,
        db: AsyncSession
) -> FittingRoomResponseSchema:
    item_stmt = select(ItemsModel).where(ItemsModel.id == item_id).options(
        selectinload(ItemsModel.size_charts),
        selectinload(ItemsModel.measurements),
    )
    item_db = await db.scalar(item_stmt)
    if not item_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    profile_stmt = select(UserProfileModel).where(UserProfileModel.user_id == user.id)
    profile_db = await db.scalar(profile_stmt)
    if not profile_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You need to create a profile first"
        )
    measurement = next(
        (m for m in item_db.measurements if m.id == payload.measurement_id),
        None
    )
    size_chart = next(
        (s for s in item_db.size_charts if s.id == payload.size_chart_id),
        None
    )

    if not measurement or not size_chart:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid measurement or size chart ID for this item."
        )

    if item_db.category == ItemCategoryEnum.PANTS:
        h_end_cm = (
            item_db.ref_coefficient * profile_db.height_cm - measurement.inseam_cm
        )
    else:
        h_end_cm = (
            item_db.ref_coefficient * profile_db.height_cm - measurement.total_length_cm
        )
    line_position_pct = (h_end_cm / profile_db.height_cm) * 100

    def does_it_fit(
            user_val: int,
            min_val: float | None = None,
            max_val: float | None = None
    ) -> str:
        if not min_val or not max_val:
            return "null"
        if user_val > max_val: return "tight"
        if user_val < min_val: return "loose"
        return "perfect"

    hips_fit = does_it_fit(
        user_val=profile_db.hips_length_cm,
        min_val=size_chart.hips_min_cm,
        max_val=size_chart.hips_max_cm
    )
    waist_fit = does_it_fit(
        user_val=profile_db.waist_length_cm,
        min_val=size_chart.waist_min_cm,
        max_val=size_chart.waist_max_cm
    )
    breast_fit = does_it_fit(
        user_val=profile_db.breast_length_cm,
        min_val=size_chart.breast_min_cm,
        max_val=size_chart.breast_max_cm
    )
    shoulders_fit = does_it_fit(
        user_val=profile_db.shoulders_length_cm,
        min_val=size_chart.shoulders_min_cm,
        max_val=size_chart.shoulders_max_cm
    )

    new_event = FitviewEventsModel(
        user_id=user.id,
        item_id=item_id,
        event_type="result_shown",
        height_used_cm=profile_db.height_cm,
        result_end_cm=h_end_cm,
        fit_shoulders=shoulders_fit,
        fit_breast=breast_fit,
        fit_waist=waist_fit,
        fit_hips=hips_fit,
        ab_group=choice(("A", "B"))
    )
    db.add(new_event)
    await db.commit()

    return FittingRoomResponseSchema(
        item_id=item_db.id,
        size_label=size_chart.size_label,
        visual_markers=VisualMarkersSchema(
            h_end_cm=round(h_end_cm, 2),
            line_position_pct=round(line_position_pct, 2),
            reference_point=item_db.reference_point
        ),
        fit_analysis=FitAnalysisSchema(
            hips_fit=hips_fit,
            waist_fit=waist_fit,
            breast_fit=breast_fit,
            shoulders_fit=shoulders_fit
        ),
        user_body=UserBodySchema(
            gender=profile_db.gender,
            height_cm=profile_db.height_cm,
            leg_length_cm=profile_db.leg_length_cm,
            waist_length_cm=profile_db.waist_length_cm,
            hips_length_cm=profile_db.hips_length_cm,
            breast_length_cm=profile_db.breast_length_cm,
            shoulders_length_cm=profile_db.shoulders_length_cm
        )
    )
