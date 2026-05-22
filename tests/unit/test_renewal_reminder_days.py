import datetime
from unittest.mock import MagicMock, patch

from services.renewal_reminders import (
    REMINDER_DAYS,
    _as_date,
    maybe_send_reminders_for_subscription,
)


def test_reminder_days_mapping():
    today = datetime.date(2026, 5, 22)
    assert REMINDER_DAYS.get((datetime.date(2026, 5, 25) - today).days) == "3_days"
    assert REMINDER_DAYS.get((datetime.date(2026, 5, 23) - today).days) == "1_day"
    assert REMINDER_DAYS.get((datetime.date(2026, 5, 22) - today).days) == "due"
    assert REMINDER_DAYS.get((datetime.date(2026, 5, 30) - today).days) is None


def test_as_date_accepts_date_and_datetime():
    d = datetime.date(2026, 5, 25)
    dt = datetime.datetime(2026, 5, 25, 14, 30)
    assert _as_date(d) == d
    assert _as_date(dt) == d


@patch("services.renewal_reminders.today_in_app_timezone")
def test_days_until_uses_app_today(mock_today):
    mock_today.return_value = datetime.date(2026, 5, 22)
    renewal = datetime.date(2026, 5, 23)
    days_until = (_as_date(renewal) - mock_today.return_value).days
    assert days_until == 1
    assert REMINDER_DAYS.get(days_until) == "1_day"


@patch("services.renewal_reminders._send_reminder")
@patch("services.renewal_reminders.User.get_by_id")
@patch("services.renewal_reminders._reminder_already_sent", return_value=False)
@patch("services.renewal_reminders.today_in_app_timezone")
def test_maybe_send_sends_when_due_today(
    mock_today, mock_already_sent, mock_get_user, mock_send
):
    mock_today.return_value = datetime.date(2026, 5, 22)
    mock_get_user.return_value = MagicMock(email="user@example.com")
    subscription = MagicMock()
    subscription.id = 1
    subscription.user_id = 1
    subscription.renewal_date = datetime.date(2026, 5, 22)

    assert maybe_send_reminders_for_subscription(subscription) is True
    mock_send.assert_called_once()


@patch("services.renewal_reminders._send_reminder")
@patch("services.renewal_reminders._reminder_already_sent", return_value=False)
@patch("services.renewal_reminders.today_in_app_timezone")
def test_maybe_send_skips_when_not_reminder_day(mock_today, mock_already_sent, mock_send):
    mock_today.return_value = datetime.date(2026, 5, 22)
    subscription = MagicMock()
    subscription.renewal_date = datetime.date(2026, 6, 1)

    assert maybe_send_reminders_for_subscription(subscription) is False
    mock_send.assert_not_called()


@patch("services.renewal_reminders._send_reminder")
@patch("services.renewal_reminders._reminder_already_sent", return_value=True)
@patch("services.renewal_reminders.today_in_app_timezone")
def test_maybe_send_skips_when_already_sent(mock_today, mock_already_sent, mock_send):
    mock_today.return_value = datetime.date(2026, 5, 22)
    subscription = MagicMock()
    subscription.renewal_date = datetime.date(2026, 5, 22)

    assert maybe_send_reminders_for_subscription(subscription) is False
    mock_send.assert_not_called()
