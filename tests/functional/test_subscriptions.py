import pytest

from flask_login import current_user

from src.api import create_app
from src.database.models import User, Subscription, Payment


@pytest.fixture()
def test_client():
    flask_app = create_app()

    with flask_app.test_client() as testing_client:
        testing_client.post(
            "/api/register",
            json={"email": "test@something.com", "password": "test"}
        )
        test_user = User.get(User.email == "test@something.com")
        testing_client.post(
            "/api/login",
            json={"email": test_user.email, "password": "test"}
        )
        testing_client.post(
            "/api/subscriptions",
            json={
                "user_id": test_user.id,
                "name": "test_subscription",
                "cost": 15.99,
                "billing_type": "monthly",
                "renewal_date": "2026-05-12"
            }
        )
        test_subscription = Subscription.get(Subscription.name == "test_subscription")
        yield testing_client
        if test_subscription:
            test_subscription.delete_instance(recursive=True)
        if test_user:
            test_user.delete_instance(recursive=True)

def test_list_subscriptions(test_client):
    response = test_client.get("/api/subscriptions")
    assert response.status_code == 200
    data = response.get_json()
    assert "subscriptions" in data
    assert len(data["subscriptions"]) != 0
    assert any(
        subscription["name"] == "test_subscription" 
        for subscription in data["subscriptions"]
    )


def test_get_subscription(test_client):
    test_subscription = Subscription.get(Subscription.name == "test_subscription")
    response = test_client.get(f"/api/subscriptions/{test_subscription.id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "test_subscription"
    assert data["cost"] == 15.99
    assert data["billing_type"] == "monthly"


def test_create_subscription(test_client):
    test_user = User.get(User.email == "test@something.com")
    response = test_client.post(
        "/api/subscriptions",
        json={
            "user_id": test_user.id,
            "name": "test_add_subscription",
            "cost": 10.99,
            "billing_type": "yearly",
            "renewal_date": "2026-05-12"
        }
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["user"] == test_user.id
    assert data["name"] == "test_add_subscription"
    assert data["cost"] == 10.99
    assert data["billing_type"] == "yearly"
    test_subscription = Subscription.get(Subscription.name == "test_add_subscription")
    test_subscription.delete_instance(recursive=True)


def test_update_subscription(test_client):
    test_subscription = Subscription.get(Subscription.name == "test_subscription")
    response = test_client.put(
        f"/api/subscriptions/{test_subscription.id}",
        json={
            "name": "test_update_subscription",
            "cost": 26.00,
            "billing_type": "yearly",
            "renewal_date": "2026-05-12"
        }
    )
    assert response.status_code == 200
    data = response.get_json()
    assert data["name"] == "test_update_subscription"
    assert data["cost"] == 26.00
    assert data["billing_type"] == "yearly"


def test_delete_subscription(test_client):
    test_subscription_id = Subscription.get(Subscription.name == "test_subscription").id
    response = test_client.delete(f"/api/subscriptions/{test_subscription_id}")
    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == f"Subscription {test_subscription_id} deleted successfully"


def test_delete_subscription_with_payments(test_client):
    """Old accounts often have payment rows from auto-billing; delete must cascade."""
    test_subscription = Subscription.get(Subscription.name == "test_subscription")
    Payment.create(
        subscription=test_subscription.id,
        amount=test_subscription.cost,
        date_paid="2026-01-01",
    )
    response = test_client.delete(f"/api/subscriptions/{test_subscription.id}")
    assert response.status_code == 200
    assert Subscription.get_or_none(test_subscription.id) is None

# Sprint 2 tests

# Required fields
def test_create_subscription_without_renewal_date(test_client):
    response = test_client.post("/api/subscriptions", json={
        "name": "bad_sub",
        "cost": 10.00,
        "billing_type": "monthly",
        # missing renewal_date
    })
    assert response.status_code == 500

def test_update_subscription_without_renewal_date(test_client):
    test_subscription = Subscription.get(Subscription.name == "test_subscription")
    response = test_client.put(
        f"/api/subscriptions/{test_subscription.id}",
        json={
            "name": "updated_name",
            "cost": 20.00,
            "billing_type": "monthly",
            # missing renewal_date
        }
    )
    assert response.status_code == 500

