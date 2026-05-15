import os

import resend

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
MAIL_FROM = os.environ.get("MAIL_FROM", "subnoreply@resend.dev")


def send_email(to: str, subject: str, html: str) -> dict:
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY is not set")

    resend.api_key = RESEND_API_KEY
    return resend.Emails.send(
        {
            "from": MAIL_FROM,
            "to": to,
            "subject": subject,
            "html": html,
        }
    )
