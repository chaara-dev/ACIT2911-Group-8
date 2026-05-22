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


def _renewal_datetime(renewal_date) -> datetime.datetime:
    return datetime.datetime.combine(_as_date(renewal_date), datetime.time.min)


def _reminder_already_sent(subscription, reminder_type: str) -> bool:
    renewal = _renewal_datetime(subscription.renewal_date)
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
        renewal_date=_renewal_datetime(subscription.renewal_date),
    )


def _reminder_type_for_subscription(subscription, today=None) -> str | None:
    if today is None:
        today = today_in_app_timezone()
    days_until = (_as_date(subscription.renewal_date) - today).days
    return REMINDER_DAYS.get(days_until)


def maybe_send_reminders_for_subscription(subscription) -> bool:
    """Send one reminder for this subscription if it is due today (3/1/0-day window).

    Uses the same dedup rules as the daily job. Failures are logged and do not raise.
    Returns True if an email was sent successfully.
    """
    reminder_type = _reminder_type_for_subscription(subscription)
    if reminder_type is None:
        return False
    if _reminder_already_sent(subscription, reminder_type):
        return False

    user = User.get_by_id(subscription.user_id)
    try:
        _send_reminder(user, subscription, reminder_type)
        return True
    except Exception as error:
        print(
            f"Failed to send {reminder_type} reminder for "
            f"subscription {subscription.id} to {user.email}: {error}"
        )
        return False


def run_renewal_reminders() -> int:
    """Send 3-day, 1-day, and due-day emails. Returns number of emails sent."""
    sent_count = 0

    for subscription in Subscription.select():
        if maybe_send_reminders_for_subscription(subscription):
            sent_count += 1

    return sent_count
