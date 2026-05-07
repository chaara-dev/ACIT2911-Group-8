# Unit tests for the Subscription CRUD routes.
import pytest
from api import create_app
 
 
@pytest.fixture
def client():
    app = create_app()
    return app.test_client()
