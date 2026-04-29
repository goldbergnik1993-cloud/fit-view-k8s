import secrets
from datetime import datetime, timezone, timedelta, UTC
from typing import Optional

from fastapi import HTTPException, status
from jose import jwt, JWTError, exceptions  # type: ignore
from passlib.context import CryptContext  # type: ignore
from sqlalchemy.ext.asyncio import AsyncSession

from core.settings import settings
from database.models.user import RefreshTokenModel

ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


async def create_refresh_token(db: AsyncSession, user_id: int) -> str:
    token = secrets.token_urlsafe(64)
    expires = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    new_token = RefreshTokenModel(
        user_id=user_id, token=token, expires_at=expires.replace(tzinfo=None)
    )
    db.add(new_token)
    await db.commit()
    await db.refresh(new_token)
    return new_token.token


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def create_token(email: str, purpose: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "purpose": purpose, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str, purpose: str):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != purpose:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token purpose."
            )
        return payload

    except exceptions.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Token has expired."
        )
    except exceptions.JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token."
        )
