from fastapi import FastAPI, status

from api.user import router as user_router

app = FastAPI()

@app.get("/health", status_code=status.HTTP_200_OK)
async def hello():
    return {"message": "I'm Healthy as always!"}

app.include_router(user_router)

