import os

from fastapi import FastAPI, status, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.staticfiles import StaticFiles

from api.admin import router as admin_router
from api.cart import router as cart_router
from api.catalog import router as catalog_router
from api.events import router as event_router
from api.orders import router as orders_router
from api.user import router as user_router
from core.settings import settings
from database.session_postgresql import get_db

app = FastAPI()


FRONTEND_URL = settings.FRONTEND_URL

origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:8080"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(os.path.join("static", "items_images"), exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/health", status_code=status.HTTP_200_OK)
async def hello():
    return {"message": "I'm Healthy as always!"}


@app.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "online"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed or is unresponsive."
        )


app.include_router(admin_router)
app.include_router(cart_router)
app.include_router(catalog_router)
app.include_router(event_router)
app.include_router(orders_router)
app.include_router(user_router)
