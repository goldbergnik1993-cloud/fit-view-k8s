from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    PROJECT_NAME: str = "FitView"
    BASE_URL: str = "http://127.0.0.1:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    DATABASE_URL: str
    SECRET_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int
    REFRESH_TOKEN_EXPIRE_DAYS: int
    ACTIVATION_CODE_EXPIRE_MINUTES: int
    RESET_TOKEN_EXPIRE_MINUTES: int

    REDIS_URL: str

    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


settings = Settings()  # type: ignore
