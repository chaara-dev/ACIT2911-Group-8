import pytest
from src.api import create_app
from src.database.models import User

@pytest.fixture()
def user_client():
    flask_app = create_app()
    with flask_app.test_client() as testing_client:
        yield testing_client