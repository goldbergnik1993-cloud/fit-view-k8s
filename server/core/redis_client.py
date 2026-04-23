import redis.asyncio as redis
from core.settings import settings


redis_pool = redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True
)

async def get_redis():
    try:
        yield redis_pool
    finally:
        pass
