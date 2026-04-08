import asyncio
from database.session_postgresql import SessionLocal
from database.models.catalog import (
    BrandsModel,
    ItemsModel,
    ItemCategoryEnum,
    SizeChartModel,
    ItemMeasurementsModel
)

async def seed():
    async with SessionLocal() as db:
        brand = BrandsModel(name="Azure Mode")
        db.add(brand)
        await db.flush()

        item = ItemsModel(
            name="A-Line Summer Breeze",
            brand_id=brand.id,
            category=ItemCategoryEnum.DRESS,
            image_url="https://example.com/images/azure-dress-01.jpg",
            price="24.99",
            reference_point="shoulder",
            ref_coefficient=0.818
        )
        db.add(item)
        await db.flush()

        for label in ["S", "M", "L"]:
            db.add(SizeChartModel(
                item_id=item.id,
                size_label=label,
                waist_min_cm=60, waist_max_cm=80,
                breast_min_cm=80, breast_max_cm=100,
                shoulders_min_cm=35, shoulders_max_cm=45
            ))

        db.add(ItemMeasurementsModel(
            item_id=item.id,
            size_label="M",
            total_length_cm=90.0,
            inseam_cm=10.0
        ))

        await db.commit()
        print("Seeded successfully")

if __name__ == "__main__":
    asyncio.run(seed())
