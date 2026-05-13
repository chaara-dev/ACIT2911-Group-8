from flask import Blueprint

subscriptions_bp = Blueprint("subscriptions", __name__)

from ....api.subscriptions import routes
