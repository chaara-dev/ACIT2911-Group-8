import pytest
from src.api import create_app
from src.database.models import User, Subscription, Payment, RenewalReminder
from datetime import date

@pytest.fixture()
def payment_client():
    flask_app = create_app()
    flask_app.config["TESTING"] = True
    with flask_app.test_client() as testing_client:
        yield testing_client

def test_payment(payment_client):
    existing = User.get_or_none(User.email == "test_payment@test.com")
    if existing:
        for sub in Subscription.select().where(Subscription.user == existing):
            Payment.delete().where(Payment.subscription == sub).execute()
            RenewalReminder.delete().where(RenewalReminder.subscription == sub).execute()
            sub.delete_instance()
        existing.delete_instance()

    test_user = User.create(
        email="test_payment@test.com",
        password_hash="password123",
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
    
    payment = Payment.get(Payment.id == test_payment.id)
    
    
    assert payment.subscription.name == "Payment Test" 
    assert payment.amount == 9.99
    paid_on = payment.date_paid
    if hasattr(paid_on, "date"):
        paid_on = paid_on.date()
    assert paid_on == date(2026, 5, 22)

    test_payment.delete_instance()  
    test_subscription.delete_instance()       
    test_user.delete_instance()      