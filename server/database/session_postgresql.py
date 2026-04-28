from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from core.settings import settings

SQLALCHEMY_DATABASE_URI = settings.DATABASE_URL

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URI,
    echo=False,
    connect_args={"ssl": True},
    pool_pre_ping=True,
    pool_recycle=300,
    pool_timeout=30,
)

SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


async def get_db():
    async with SessionLocal() as session:
        yield session
