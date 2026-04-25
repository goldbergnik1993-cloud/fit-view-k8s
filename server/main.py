import os

from fastapi import FastAPI, status, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.staticfiles import StaticFiles

from api.admin import router as admin_router
from api.auth import router as auth_router
from api.cart import router as cart_router
from api.catalog import router as catalog_router
from api.events import router as event_router
from api.orders import router as orders_router
from api.payments import router as payments_router
from api.user import router as user_router
from core.settings import settings
from database.session_postgresql import get_db

tags_metadata = [
    {
        "name": "auth",
        "description": "Identity management. Handles user registration, token generation, email verification, and password resets.",
    },
    {
        "name": "user",
        "description": "Current user operations. Manage profile data, body measurements, favorites, and secure email updates.",
    },
    {
        "name": "catalog",
        "description": "Product catalog operations. Includes search, filtering, inventory management, and the core Virtual Fitting Room engine.",
    },
    {
        "name": "cart",
        "description": "Manage user shopping cart sessions, including adding items, updating quantities, and calculating totals.",
    },
    {
        "name": "orders",
        "description": "Order management. Handles converting carts into orders, fetching order history, and initializing checkout sessions.",
    },
    {
        "name": "payments",
        "description": "Secure financial endpoints. Handles external payment gateway webhooks.",
    },
    {
        "name": "admin",
        "description": "Administrative operations for managing users, orders, and system resources. **Requires elevated privileges.**",
    },
    {
        "name": "analytics",
        "description": "Telemetry and event tracking to monitor user interactions with the Virtual Fitting Room.",
    },
]

app = FastAPI(
    root_path="/api",
    title="FitView API",
    description="The core backend API for the FitView e-commerce and virtual fitting room platform.",
    version="0.1.0",
    openapi_tags=tags_metadata
)


FRONTEND_URL = settings.FRONTEND_URL

origins = [FRONTEND_URL, "http://localhost:3000", "http://localhost:8080"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(os.path.join("static", "items_images"), exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get(
    "/health", status_code=status.HTTP_200_OK, summary="System Health Check"
)
async def health():
    """
    Performs a basic liveness probe to verify the application container is
    running and accepting requests.
    """
    return {"message": "I'm Healthy as always!"}


@app.get(
    "/ready", status_code=status.HTTP_200_OK, summary="System Readiness Check"
)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Performs a deep readiness probe. Verifies that the application is fully
    booted and successfully connected to PostgreSQL.
    """
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "online"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection failed or is unresponsive.",
        )


app.include_router(event_router)
app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(catalog_router)
app.include_router(cart_router)
app.include_router(orders_router)
app.include_router(payments_router)
