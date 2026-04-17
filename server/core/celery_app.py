from celery import Celery
from celery.schedules import crontab

from core.settings import settings

redis_url = settings.REDIS_URL

celery_app = Celery(
    "fitview_worker",
    broker=redis_url,
    backend=redis_url,
    include=["tasks.email_tasks", "tasks.cleanup_tasks"]
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
