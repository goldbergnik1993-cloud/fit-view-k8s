import asyncio
import json
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.catalog import (
    BrandsModel,
    ItemsModel,
    SizeChartModel,
    ItemMeasurementsModel,
)
from database.models.user import UserModel, UserRoleEnum
from database.session_postgresql import SessionLocal, engine

SEED_FILE = Path(__file__).parent.parent / "seed_data.json"


async def get_or_create_brand(db: AsyncSession, name: str) -> BrandsModel:
    brand = await db.scalar(
        select(BrandsModel).where(BrandsModel.name == name))
    if not brand:
        brand = BrandsModel(name=name)
        db.add(brand)
        await db.flush()
    return brand


async def seed():
    if not SEED_FILE.exists():
        print(f"Error: Seed file not found at {SEED_FILE}")
        return

    with open(SEED_FILE, "r", encoding="utf-8") as f:
        items_data = json.load(f)

    print(f"Starting seeding process for {len(items_data)} items...")

    async with SessionLocal() as db:
        for entry in items_data:
            brand = await get_or_create_brand(db, entry["brand"])

            existing = await db.scalar(
                select(ItemsModel).where(
                    ItemsModel.name == entry["name"],
                    ItemsModel.brand_id == brand.id,
                    ItemsModel.category == entry["category"],
                )
            )

            if existing:
                print(f"  Skipping '{entry['name']}' - already exists.")
                continue

            item = ItemsModel(
                name=entry["name"],
                brand_id=brand.id,
                category=entry["category"],
                gender=entry.get("gender", "unisex"),
                price=entry["price"],
                image_url=entry["image_url"],
                reference_point=entry["reference_point"],
                ref_coefficient=entry["ref_coefficient"],
            )
            db.add(item)
            await db.flush()

            for sc in entry.get("size_charts", []):
                db.add(SizeChartModel(
                    item_id=item.id,
                    size_label=sc["size_label"],
                    waist_min_cm=sc["waist_min_cm"],
                    waist_max_cm=sc["waist_max_cm"],
                    breast_min_cm=sc["breast_min_cm"],
                    breast_max_cm=sc["breast_max_cm"],
                    hips_min_cm=sc["hips_min_cm"],
                    hips_max_cm=sc["hips_max_cm"],
                    shoulders_min_cm=sc["shoulders_min_cm"],
                    shoulders_max_cm=sc["shoulders_max_cm"],
                ))

            for m in entry.get("measurements", []):
                db.add(ItemMeasurementsModel(
                    item_id=item.id,
                    size_label=m["size_label"],
                    total_length_cm=m["total_length_cm"],
                    inseam_cm=m["inseam_cm"],
                ))

            print(f"  Seeded '{entry['name']}' ({entry['brand']})")

        await db.commit()
        print("\nSuccess: All items seeded.")


async def make_admin(email: str):
    async with SessionLocal() as db:
        user = await db.scalar(
            select(UserModel).where(UserModel.email == email))
        if not user:
            print(f"Error: No user found with email '{email}'")
            return

        if user.role == UserRoleEnum.ADMIN:
            print(f"'{email}' is already an admin.")
            return

        user.role = UserRoleEnum.ADMIN
        await db.commit()
        print(f"Success: '{email}' has been assigned the admin role.")


async def main():
    try:
        if len(sys.argv) == 1:
            await seed()
        elif sys.argv[1] == "make-admin":
            if len(sys.argv) < 3:
                print("Usage: python -m scripts.seed_db make-admin <email>")
            else:
                await make_admin(sys.argv[2])
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
