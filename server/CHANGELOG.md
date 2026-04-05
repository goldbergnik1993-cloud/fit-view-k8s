# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

## Added
- **Models**: Add to `UserModel` relationships to `FitviewEventsModel` and `FavoriteModel`.
- **Models & Migrations**: Implemented `ItemsModel`, `SizeChartModel`, `ItemMeasurementsModel`, `FavoritesModel`, `FitviewEventsModel`, made corresponding migrations.
- **API**: Exposed profile management `GET/POST` endpoints via `/user/profile`
- **Services**: Added `profile_create` and `get_user_profile` services. Added `get_current_user` dependency.
- **Schemas**: Added `ProfileBaseSchema` and `ProfileViewSchema` featuring user's profile creation and retrieving.
- **Models**: Introduced `RefreshTokenModel` for managing active user sessions.
- **Services**: 
    - `user_create`: Handles new user registration.
    - `user_login`: Validates credentials and issues JWT pairs.
    - `refresh_token_pair`: Manages secure token rotation and session extension.
    - implemented `hash_password`, `create_refresh_token`, `verify_password`, `create_access_token`, `decode_access_token` utilities for handling authentication tokens.
- **Schemas**: 
    - Added `UserCreateSchema` featuring password complexity validation.
    - Implemented `TokenPairResponse` and `RefreshTokenRequest` for standard JWT handling.
- **API**: Exposed user management endpoints via `/user`.
- **Migrations**: Generated and applied the initial Alembic migration to create `users` and `user_profiles` tables.
- **Migrations**: Initialized **Alembic** for database migrations, including custom configuration in `env.py` for asynchronous support.
- **Models**: Implemented `UserModel` and `UserProfileModel` with SQLAlchemy, establishing the core user data architecture.
- **Infrastructure**: Initialized project with **Poetry** and defined a modular FastAPI directory structure.
- **Configuration**: Implemented `BaseSettings` using `pydantic-settings` to handle environment variables for Database, Security, and App metadata.
- **Database**: Configured asynchronous PostgreSQL connection using `SQLAlchemy` and `async_sessionmaker`.
- **Environment**: Added `.env.sample` for team-wide configuration consistency and `.gitignore` to protect sensitive data.

## Fixed
### Infrastructure & DevOps
- [cite_start]**Environment**: Fixed a bug where `.env` was ignored by Docker, preventing Pydantic from loading settings.
- **Docker Compose**: Switched to explicit environment variable mapping for better security and configuration tracking.
- [cite_start]**Database**: Corrected the `DATABASE_URL` driver to `postgresql+asyncpg` to support SQLAlchemy's asynchronous engine.