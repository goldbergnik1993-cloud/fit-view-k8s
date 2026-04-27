import smtplib
from email.message import EmailMessage

from core.celery_app import celery_app
from core.logging_config import logger
from core.settings import settings


@celery_app.task(name="tasks.email_tasks.send_email", bind=True, max_retries=3)
def send_email(self, email: str, body_data: dict, msg_type: str):
    log = logger.bind(
        recipient=email,
        task_type=msg_type,
        retry_count=self.request.retries
    )
    log.info("email_task_started")

    subjects = {
        "activation": "Welcome to FitView! Please verify your email",
        "reset_pass": "Reset your password",
        "reset_pass_success": "Your password has been changed",
        "changing_email": "Please confirm your new email",
    }
    subject = subjects.get(msg_type, "Notification").format(**body_data)
    html_content = body_data.get("html", f"<p>Action required: {msg_type}</p>")

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = "noreply@fitview.dev"
        msg["To"] = email
        msg.set_content("Please enable HTML to view this email.")
        msg.add_alternative(html_content, subtype="html")

        log.debug(
            "smtp_connection_opening",
            host=settings.SMTP_HOST,
            port=settings.SMTP_PORT
        )

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.send_message(msg)

        log.info("email_sent_successfully")

        return f"Sent email via Mailhog to {email}"

    except Exception as e:
        log.error(
            "email_delivery_failed", error=str(e),
              will_retry=self.request.retries < self.max_retries
        )
        raise self.retry(exc=e, countdown=60)
