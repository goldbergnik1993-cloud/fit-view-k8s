# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Migrations**: Generated and applied the initial Alembic migration to create `users` and `user_profiles` tables.
- **Migrations**: Initialized **Alembic** for database migrations, including custom configuration in `env.py` for asynchronous support.
- **Models**: Implemented `UserModel` and `UserProfileModel` with SQLAlchemy, establishing the core user data architecture.
- **Infrastructure**: Initialized project with **Poetry** and defined a modular FastAPI directory structure.
- **Configuration**: Implemented `BaseSettings` using `pydantic-settings` to handle environment variables for Database, Security, and App metadata.
- **Database**: Configured asynchronous PostgreSQL connection using `SQLAlchemy` and `async_sessionmaker`.
- **Environment**: Added `.env.sample` for team-wide configuration consistency and `.gitignore` to protect sensitive data.
