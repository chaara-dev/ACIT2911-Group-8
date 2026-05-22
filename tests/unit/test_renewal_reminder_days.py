import datetime
from unittest.mock import patch

from services.renewal_reminders import REMINDER_DAYS, _as_date


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
