import datetime

from flask_login import UserMixin
from peewee import (
    AutoField,
    CharField,
    DateField,
    DateTimeField,
    ForeignKeyField,
    FloatField
)

from .database import BaseModel


def _default_date_paid():
    from src.util.app_dates import today_in_app_timezone
    return today_in_app_timezone()


def _default_sent_on():
    from src.util.app_dates import now_in_app_timezone
    return now_in_app_timezone()


class User(UserMixin, BaseModel):
    id = AutoField()
    email = CharField(unique=True)
    password_hash = CharField()

    def to_dict(self):
        return {
            "id": self.id,
        }
    

class Subscription(BaseModel):
    id = AutoField()
    user = ForeignKeyField(User, backref="subscriptions")
    name = CharField()
    cost = FloatField()
    billing_type = CharField(max_length=20, default="unknown")
    renewal_date = DateField()

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user_id,
            "name": self.name,
            "cost": self.cost,
            "billing_type": self.billing_type,
            "renewal_date": self.renewal_date.isoformat(),
            "payments": [payment.to_dict() for payment in self.payments]
        }


class Payment(BaseModel):
    id = AutoField()
    subscription = ForeignKeyField(Subscription, backref="payments")
    date_paid = DateField(default=_default_date_paid)
    amount = FloatField()

    def to_dict(self):
        return {
            "id": self.id,
            "subscription": self.subscription_id,
            "date_paid": self.date_paid.isoformat(),
            "amount": self.amount
        }


class RenewalReminder(BaseModel):
    id = AutoField()
    subscription = ForeignKeyField(Subscription, backref="renewal_reminders")
    reminder_type = CharField(max_length=20)
    renewal_date = DateTimeField()
    sent_on = DateTimeField(default=_default_sent_on)

    class Meta:
        indexes = (
            (("subscription", "reminder_type", "renewal_date"), True),
        )

    def to_dict(self):
        return {
            "id": self.id,
            "subscription": self.subscription_id,
            "reminder_type": self.reminder_type,
            "renewal_date": self.renewal_date,
            "sent_on": self.sent_on.isoformat(),
        }
