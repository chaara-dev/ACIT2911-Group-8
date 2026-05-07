# Unit tests for the Subscription CRUD routes.
import pytest
from api import create_app
 
 
@pytest.fixture
def client():
    app = create_app()
    return app.test_client()

# POST tests
def test_create_subscription(client):
    response = client.post("/api/subscriptions", json={
        "user_id": 1,
        "name": "Netflix",
        "cost": 12.99,
        "billing_type": "monthly"
    })
    assert response.status_code == 201
 
 
def test_create_unfinished_subscription(client):
    response = client.post("/api/subscriptions", json={
        "name": "Netflix"
    })
    assert response.status_code == 400

