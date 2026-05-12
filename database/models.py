from .database import BaseModel
from flask_login import UserMixin

import datetime

from peewee import (
    AutoField,
    CharField,
    FloatField,
    DateTimeField,
    ForeignKeyField
)

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
    renewal_date = DateTimeField()

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user_id,
            "name": self.name,
            "cost": self.cost,
            "billing_type": self.billing_type,
            "renewal_date": self.renewal_date.isoformat(),
        }


class Payment(BaseModel):
    id = AutoField()
    subscription = ForeignKeyField(Subscription, backref="payments")
    date_paid = DateTimeField(default=datetime.datetime.now)
    amount = FloatField()

    def to_dict(self):
        return {
            "id": self.id,
            "subscription": self.subscription_id,
            "date_paid": self.date_paid.isoformat(),
            "amount": self.amount
        }
