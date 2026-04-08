from fastapi import FastAPI, status, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from api.catalog import router as catalog_router
from api.user import router as user_router
from database.session_postgresql import get_db

app = FastAPI()


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


app.include_router(user_router)
app.include_router(catalog_router)
