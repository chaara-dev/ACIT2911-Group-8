import pytest
from src.api import create_app
from src.database.models import User, Subscription, Payment
from datetime import date