import smtplib
from email.message import EmailMessage

from core.celery_app import celery_app


@celery_app.task(name="tasks.email_tasks.send_email", bind=True, max_retries=3)
def send_email(self, email: str, body_data: dict, msg_type: str):
    subjects = {
        "activation": "Welcome to FitView! Please verify your email",
        "reset_pass": "Reset your password",
        "reset_pass_success": "Your password has been changed",
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

        with smtplib.SMTP("mailhog", 1025) as server:
            server.send_message(msg)
        return f"Sent email via Mailhog to {email}"

    except Exception as e:
        raise self.retry(exc=e, countdown=60)
