import json
from typing import List, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from redis import Redis
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

# from core import redis_client
from core.logging_config import logger
from core.redis_client import get_redis
from database.models.user import UserModel, UserRoleEnum
from database.session_postgresql import get_db
from utils.tokens import decode_access_token

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)


async def get_user_by_id(
        user_id: int, db: AsyncSession, redis_client: Redis
) -> UserModel:
    cache_key = f"auth_user:{user_id}"

    cached_user_str = await redis_client.get(cache_key)

    if cached_user_str:
        user_data = json.loads(cached_user_str)
        return UserModel(**user_data)

    user_stmt = select(UserModel).where(UserModel.id == int(user_id))
    result = await db.execute(user_stmt)
    user = result.scalar_one_or_none()

    if not user:
        logger.warning("auth_failed", reason="user_not_found", user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    user_dict = {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "ab_group": user.ab_group,
    }
    await redis_client.setex(cache_key, 300, json.dumps(user_dict))

    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        logger.warning("auth_failed", reason="invalid_token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user_id = payload.get("sub")
    return await get_user_by_id(
        user_id=user_id, db=db, redis_client=redis_client
    )


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(optional_security),
    db: AsyncSession = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
) -> Optional[UserModel]:
    if not credentials:
        return None

    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        logger.warning("auth_failed", reason="invalid_token")
        return None

    user_id = payload.get("sub")
    return await get_user_by_id(
        user_id=user_id, db=db, redis_client=redis_client
    )


async def get_user_by_email(email: str, db: AsyncSession) -> Optional[UserModel]:
    stmt = select(UserModel).where(UserModel.email == email)
    return await db.scalar(stmt)


class RoleChecker:
    def __init__(self, allowed_roles: List[UserRoleEnum]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: UserModel = Depends(get_current_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have enough permissions to access this resource.",
            )
        return user
