import pytest
from src.api import create_app
from src.database.models import User, Subscription, Payment
from datetime import date

@pytest.fixture()
def payment_client():
    flask_app = create_app()
    with flask_app.test_client() as testing_client:
        yield testing_client

def test_payment(payment_client):
    #create user
    test_user = User.create(
        email="test_payment@test.com", 
        password_hash="password123"
    )
    
    #create subscription
    test_subscription = Subscription.create(
        user=test_user,
        name="Payment Test",
        cost=9.99,
        billing_type="monthly",
        renewal_date=date(2026, 5, 22)
    )

    #creat payment
    test_payment = Payment.create(
        subscription=test_subscription.id,
        amount=test_subscription.cost,
        date_paid=test_subscription.renewal_date
    )
