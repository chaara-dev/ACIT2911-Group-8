import datetime

from src.database.models import RenewalReminder, Subscription, User
from src.util.app_dates import today_in_app_timezone
from services.email import send_email

REMINDER_DAYS = {
    3: "3_days",
    1: "1_day",
    0: "due",
}

SUBJECTS = {
    "3_days": "Subscription renewing in 3 days",
    "1_day": "Subscription renewing tomorrow",
    "due": "Subscription renewing today",
}


def _as_date(value) -> datetime.date:
    if isinstance(value, datetime.datetime):
        return value.date()
    if isinstance(value, datetime.date):
        return value
    raise TypeError(f"Unsupported renewal_date type: {type(value)!r}")


def _reminder_already_sent(subscription, reminder_type: str) -> bool:
    renewal = _as_date(subscription.renewal_date)
    return (
        RenewalReminder.select()
        .where(
            (RenewalReminder.subscription == subscription.id)
            & (RenewalReminder.reminder_type == reminder_type)
            & (RenewalReminder.renewal_date == renewal)
        )
        .exists()
    )


def _build_html(subscription, reminder_type: str) -> str:
    renewal = _as_date(subscription.renewal_date).strftime("%Y-%m-%d")
    if reminder_type == "3_days":
        when = "in 3 days"
    elif reminder_type == "1_day":
        when = "tomorrow"
    else:
        when = "today"
    return (
        f"<p>Your subscription <strong>{subscription.name}</strong> "
        f"(${subscription.cost}/{subscription.billing_type}) renews {when} "
        f"(renewal date: {renewal}).</p>"
    )


def _send_reminder(user: User, subscription, reminder_type: str) -> None:
    subject = SUBJECTS[reminder_type]
    html = _build_html(subscription, reminder_type)
    send_email(to=user.email, subject=subject, html=html)
    RenewalReminder.create(
        subscription=subscription.id,
        reminder_type=reminder_type,
        renewal_date=_as_date(subscription.renewal_date),
    )


def run_renewal_reminders() -> int:
    """Send 3-day, 1-day, and due-day emails. Returns number of emails sent."""
    today = today_in_app_timezone()
    sent_count = 0

    for subscription in Subscription.select():
        days_until = (_as_date(subscription.renewal_date) - today).days
        reminder_type = REMINDER_DAYS.get(days_until)
        if reminder_type is None:
            continue
        if _reminder_already_sent(subscription, reminder_type):
            continue

        user = User.get_by_id(subscription.user_id)
        try:
            _send_reminder(user, subscription, reminder_type)
            sent_count += 1
        except Exception as error:
            print(
                f"Failed to send {reminder_type} reminder for "
                f"subscription {subscription.id} to {user.email}: {error}"
            )

    return sent_count
