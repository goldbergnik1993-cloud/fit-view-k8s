from fastapi import FastAPI, status

from api.catalog import router as catalog_router
from api.user import router as user_router

app = FastAPI()


@app.get("/health", status_code=status.HTTP_200_OK)
async def hello():
    return {"message": "I'm Healthy as always!"}


app.include_router(user_router)
app.include_router(catalog_router)
