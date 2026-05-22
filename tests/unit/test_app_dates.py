import datetime
import os
from unittest.mock import patch
from zoneinfo import ZoneInfo

from src.util.app_dates import (
    DEFAULT_TIMEZONE,
    get_app_timezone,
    now_in_app_timezone,
    today_in_app_timezone,
)


def test_default_timezone_is_vancouver(monkeypatch):
    monkeypatch.delenv("APP_TIMEZONE", raising=False)
    assert get_app_timezone().key == DEFAULT_TIMEZONE


def test_app_timezone_from_env():
    with patch.dict(os.environ, {"APP_TIMEZONE": "America/Toronto"}):
        assert get_app_timezone().key == "America/Toronto"


def test_invalid_timezone_falls_back_to_default():
    with patch.dict(os.environ, {"APP_TIMEZONE": "Not/A/Real/Zone"}):
        assert get_app_timezone().key == DEFAULT_TIMEZONE


def test_today_matches_zoned_now():
    tz = ZoneInfo("America/Vancouver")
    with patch.dict(os.environ, {"APP_TIMEZONE": "America/Vancouver"}):
        expected = datetime.datetime.now(tz).date()
        assert today_in_app_timezone() == expected


def test_now_is_naive_wall_clock_in_app_tz():
    tz = ZoneInfo("America/Vancouver")
    with patch.dict(os.environ, {"APP_TIMEZONE": "America/Vancouver"}):
        value = now_in_app_timezone()
        assert value.tzinfo is None
        expected = datetime.datetime.now(tz).replace(tzinfo=None)
        assert abs((value - expected).total_seconds()) < 2
