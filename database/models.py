from .database import BaseModel
import datetime

from peewee import (
    AutoField,
    CharField,
    FloatField,
    DateTimeField,
    ForeignKeyField
)

class User(BaseModel):
    id = AutoField()
    username = CharField(unique=True, max_length=255)
    email = CharField(unique=True)
    password_hash = CharField()
    created_at = DateTimeField(default=datetime.datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "created_at": self.created_at.isoformat()
        }
    

class Subscription(BaseModel):
    id = AutoField()
    user = ForeignKeyField(User, backref="subscriptions")
    name = CharField()
    cost = FloatField()
    billing_type = CharField(max_length=20, default="unknown")
    subscribed_on = DateTimeField(default=datetime.datetime.now)
    created_at = DateTimeField(default=datetime.datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "user": self.user_id,
            "name": self.name,
            "cost": self.cost,
            "billing_type": self.billing_type,
            "subscribed_on": self.subscribed_on.isoformat(),
            "created_at": self.created_at.isoformat()
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
