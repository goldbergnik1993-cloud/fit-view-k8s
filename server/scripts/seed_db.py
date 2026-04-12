import asyncio
import json
import sys
from pathlib import Path

from sqlalchemy import select

from database.models.catalog import (
    BrandsModel,
    ItemsModel,
    SizeChartModel,
    ItemMeasurementsModel,
    ItemCategoryEnum,
)
from database.models.user import UserModel, UserRoleEnum
from database.session_postgresql import SessionLocal

SEED_FILE = Path(__file__).parent.parent / "seed_data.json"

async def get_or_create_brand(db, name: str) -> BrandsModel:
    brand = await db.scalar(select(BrandsModel).where(BrandsModel.name == name))
    if not brand:
        brand = BrandsModel(name=name)
        db.add(brand)
        await db.flush()
    return brand


async def seed():
    with open(SEED_FILE, "r", encoding="utf-8") as f:
        items_data = json.load(f)

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
                print(f"  skipping '{entry['name']}' ({entry['brand']}) — already exists")
                continue

            reference_point = entry["reference_point"]

            item = ItemsModel(
                name=entry["name"],
                brand_id=brand.id,
                category=ItemCategoryEnum(entry["category"]),
                gender=entry["gender"],
                image_url=entry["image_url"],
                price=entry["price"],
                reference_point=reference_point,
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
                    hips_min_cm=sc.get("hips_min_cm", 0),
                    hips_max_cm=sc.get("hips_max_cm", 0),
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

            print(f"  seeded '{entry['name']}' ({entry['brand']})")

        await db.commit()
        print("\nDone — all items seeded.")


async def make_admin(email: str):
    async with SessionLocal() as db:
        user = await db.scalar(select(UserModel).where(UserModel.email == email))
        if not user:
            print(f"Error: no user found with email '{email}'")
            sys.exit(1)

        if user.role == UserRoleEnum.ADMIN:
            print(f"'{email}' is already an admin.")
            return

        user.role = UserRoleEnum.ADMIN
        await db.commit()
        print(f"'{email}' has been assigned the admin role.")


if __name__ == "__main__":
    if len(sys.argv) == 1:
        asyncio.run(seed())

    elif sys.argv[1] == "make-admin":
        if len(sys.argv) < 3:
            print("Usage: python seed_db.py make-admin <email>")
            sys.exit(1)
        asyncio.run(make_admin(sys.argv[2]))

    else:
        print("Usage:")
        print("  python seed_db.py                        # seed the database")
        print("  python seed_db.py make-admin <email>     # assign admin role")
        sys.exit(1)
