from celery import Celery  # type: ignore
from celery.schedules import crontab  # type: ignore
from celery.signals import worker_process_init  # type: ignore

from core.logging_config import logger, setup_logging
from core.settings import settings
from database.session_postgresql import engine

redis_url = settings.REDIS_URL
setup_logging()

celery_app = Celery(
    "fitview_worker",
    broker=redis_url,
    backend=redis_url,
    include=["tasks.email_tasks", "tasks.cleanup_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    "delete-expired-tokens-daily": {
        "task": "tasks.cleanup_tasks.cleanup_expired_tokens",
        "schedule": crontab(hour=3, minute=0),
    },
    "mark-carts-abandoned-hourly": {
        "task": "tasks.cleanup_tasks.mark_carts_abandoned",
        "schedule": crontab(minute=0),
    },
}


@worker_process_init.connect
def dispose_sqlalchemy_engine(**kwargs):
    """
    Forces the new Celery worker to drop the pre-forked database
    connection pool and create a fresh one.
    """
    import asyncio

    try:
        asyncio.run(engine.dispose())
        logger.info("celery_worker_db_engine_reset_success")
    except Exception as e:
        logger.error("celery_worker_db_engine_reset_failed", error=str(e))
