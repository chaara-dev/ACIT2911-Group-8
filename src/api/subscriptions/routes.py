import datetime

from flask import current_app, request, jsonify
from flask_login import current_user, login_required

from src.database.models import Subscription, Payment
from src.util.app_dates import today_in_app_timezone
from services.renewal_reminders import maybe_send_reminders_for_subscription
from . import subscriptions_bp


def _try_send_reminders_for_subscription(subscription) -> None:
    """Send reminders on save in production only; skip during pytest (shared CI DB)."""
    if current_app.config.get("TESTING"):
        return
    maybe_send_reminders_for_subscription(subscription)


def process_subscriptions():
    now = today_in_app_timezone()
    for sub in Subscription.select().where(Subscription.user == current_user.id):
        # Only roll forward after the renewal date has passed (< today).
        # renewal_date == today means "due today" — still valid for reminders.
        while sub.renewal_date < now:
            Payment.create(
                subscription=sub.id,
                amount=sub.cost,
                date_paid=sub.renewal_date
            )
            if sub.billing_type.lower() == "monthly":
                sub.renewal_date = sub.renewal_date + datetime.timedelta(days=30)
            else:
                sub.renewal_date = sub.renewal_date + datetime.timedelta(days=365)
        sub.save()


@subscriptions_bp.route("/subscriptions", methods=["GET"])
@login_required
def list_subscriptions():
    process_subscriptions()

    query = Subscription.select().where(Subscription.user == current_user.id)
    query = query.order_by(Subscription.renewal_date)

    results = []
    for result in query:
        results.append(result.to_dict())

    return jsonify({"subscriptions": results})
 
 
@subscriptions_bp.route("/subscriptions/<int:sub_id>", methods=["GET"])
@login_required
def get_subscription(sub_id):
    sub = Subscription.get_or_none(
        (Subscription.id == sub_id) & (Subscription.user == current_user.id)
    )
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404
 
    return jsonify(sub.to_dict())


@subscriptions_bp.route("/subscriptions", methods=["POST"])
@login_required
def create_subscription():
    data = request.get_json()
 
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
 
    user_id = current_user.id
    name = data.get("name")
    cost = data.get("cost")
    billing_type = data.get("billing_type")
    renewal_date_str = data.get("renewal_date")

    if not name or cost is None or not billing_type or not renewal_date_str:
        return jsonify({"error": "name, cost, billing_type, and renewal_date are required"}), 400

    renewal_date = datetime.date.fromisoformat(renewal_date_str)

    new_sub = Subscription.create(
        user=user_id,
        name=name,
        cost=cost,
        billing_type=billing_type,
        renewal_date=renewal_date,
    )
    _try_send_reminders_for_subscription(new_sub)

    return jsonify(new_sub.to_dict()), 201


@subscriptions_bp.route("/subscriptions/<int:sub_id>", methods=["PUT"])
@login_required
def update_subscription(sub_id):
    sub = Subscription.get_or_none(
        (Subscription.id == sub_id) & (Subscription.user == current_user.id)
    )
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404
 
    data = request.get_json()
 
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
 
    name = data.get("name")
    cost = data.get("cost")
    billing_type = data.get("billing_type")
    renewal_date_str = data.get("renewal_date")

    if not name or cost is None or not billing_type or not renewal_date_str:
        return jsonify({"error": "name, cost, billing_type, renewal_date are required"}), 400

    renewal_date = datetime.date.fromisoformat(renewal_date_str)

    sub.name = name
    sub.cost = cost
    sub.billing_type = billing_type
    sub.renewal_date = renewal_date
    sub.save()
    _try_send_reminders_for_subscription(sub)

    return jsonify(sub.to_dict())


@subscriptions_bp.route("/subscriptions/<int:sub_id>", methods=["DELETE"])
@login_required
def delete_subscription(sub_id):
    sub = Subscription.get_or_none(
        (Subscription.id == sub_id) & (Subscription.user == current_user.id)
    )
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404

    # Old subscriptions may have payments (auto-billing) and renewal reminders.
    sub.delete_instance(recursive=True)

    return jsonify({"message": f"Subscription {sub_id} deleted successfully"})
