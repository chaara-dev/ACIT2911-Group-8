import datetime
import os
from zoneinfo import ZoneInfo

DEFAULT_TIMEZONE = "America/Vancouver"


def get_app_timezone() -> ZoneInfo:
    name = os.environ.get("APP_TIMEZONE", DEFAULT_TIMEZONE).strip()
    if not name:
        name = DEFAULT_TIMEZONE
    try:
        return ZoneInfo(name)
    except Exception:
        return ZoneInfo(DEFAULT_TIMEZONE)


def today_in_app_timezone() -> datetime.date:
    return datetime.datetime.now(get_app_timezone()).date()


def now_in_app_timezone() -> datetime.datetime:
    """Naive datetime in app timezone (wall clock) for DB fields."""
    return datetime.datetime.now(get_app_timezone()).replace(tzinfo=None)
