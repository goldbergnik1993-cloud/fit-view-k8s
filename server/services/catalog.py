from fastapi import Request, HTTPException, status
from sqlalchemy import select, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database.models.catalog import ItemsModel, SizeChartModel
from schemas.catalog import ItemsListSchema, ItemListItemSchema
from utils.service_helpers import pagination_helper


async def get_items_list(
        request: Request,
        db: AsyncSession,
        filters: dict,
        page: int,
        per_page: int,
        sort_by: str
):
    stmt = select(ItemsModel)
    if filters.get("category"):
        stmt = stmt.where(
            ItemsModel.category.ilike(f"%{filters['category']}%"))
    if filters.get("name"):
        stmt = stmt.where(
            ItemsModel.name.ilike(f"%{filters['name']}%")
        )
    if filters.get("brands"):
        stmt = stmt.where(ItemsModel.brand_id.in_(filters["brands"]))

    if filters.get("size"):
        stmt = stmt.join(ItemsModel.size_charts).where(
            SizeChartModel.id.is_(filters["size"])
        )
    # if filters.get("size"):
    #     stmt = stmt.join(ItemsModel.size_charts).where(
    #         SizeChartModel.size_label.ilike(f"%{filters['size']}%")
    #     )

    if filters.get("min_price"):
        stmt = stmt.where(ItemsModel.price >= filters["min_price"])
    if filters.get("max_price"):
        stmt = stmt.where(ItemsModel.price <= filters["max_price"])

    sort_options = {
        "price_asc": asc(ItemsModel.price),
        "price_desc": desc(ItemsModel.price),
    }

    stmt = stmt.order_by(
        sort_options.get(sort_by, asc(ItemsModel.price)))
    stmt = stmt.options(
        selectinload(ItemsModel.brand),
        selectinload(ItemsModel.size_charts),
        selectinload(ItemsModel.measurements)
    )

    result = await pagination_helper(
        request=request, db=db, stmt=stmt, page=page, per_page=per_page
    )

    return ItemsListSchema(
        items=[
            ItemListItemSchema(
                id=piece.id,
                name=piece.name,
                brand=piece.brand.name if piece.brand else "Unknown",
                category=piece.category,
                image_url=piece.image_url,
                price=piece.price,
                available_sizes=[
                    size.size_label for size in piece.size_charts
                ],
                available_measurements=[
                    measure.size_label for measure in piece.measurements
                ]
            ) for piece in result["items"]
        ],
        total_items=result["total_items"],
        total_pages=result["total_pages"],
        prev_page=result["prev_page"],
        next_page=result["next_page"]
    )
