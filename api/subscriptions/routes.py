from flask import request, jsonify

from flask_login import login_required, current_user

from database.models import Subscription , Payment

import datetime

from . import subscriptions_bp

# Subscription CRUD (Leon's code)
def process_subscriptions():
    now = datetime.datetime.now()
    for sub in Subscription.select().where(Subscription.user == current_user.id):
        while sub.renewal_date <= now:
            Payment.create(
                subscription=sub.id,
                amount=sub.cost,
                date_paid=sub.renewal_date
            )
            if sub.billing_type.lower == "monthly":
                sub.renewal_date = sub.renewal_date + datetime.timedelta(days=30)
            else:
                sub.renewal_date = sub.renewal_date + datetime.timedelta(days=365)
        sub.save()


@subscriptions_bp.route("/subscriptions", methods=["GET"])
@login_required
def list_subscriptions():
    process_subscriptions()

    search = request.args.get("search")
    billing_type = request.args.get("billing_type")
    sort = request.args.get("sort", "renewal_date")
    order = request.args.get("order", "desc")

    query = Subscription.select().where(Subscription.user == current_user.id)

    if search:
        query = query.where(Subscription.name ** f"%{search}%")

    if billing_type:
        query = query.where(Subscription.billing_type == billing_type)

    sort_fields = {
        "cost": Subscription.cost,
        "name": Subscription.name,
        "renewal_date": Subscription.renewal_date,
    }
    sort_field = sort_fields.get(sort, Subscription.renewal_date)

    if order == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

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
    renewal_date = data.get("renewal_date")

    if not user_id or not name or cost is None or not billing_type or not renewal_date:
        return jsonify({"error": "user_id, name, cost, billing_type, and renewal_date are required"}), 400
 
    new_sub = Subscription.create(
        user=user_id,
        name=name,
        cost=cost,
        billing_type=billing_type,
        renewal_date=renewal_date,
    )
 
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
    renewal_date = data.get("renewal_date")

    if not name or cost is None or not billing_type or not renewal_date:
        return jsonify({"error": "name, cost, billing_type, renewal_date are required"}), 400
 
    sub.name = name
    sub.cost = cost
    sub.billing_type = billing_type
    sub.renewal_date = renewal_date
    sub.save()
 
    return jsonify(sub.to_dict())

@subscriptions_bp.route("/subscriptions/<int:sub_id>", methods=["DELETE"])
@login_required
def delete_subscription(sub_id):
    sub = Subscription.get_or_none(
        (Subscription.id == sub_id) & (Subscription.user == current_user.id)
    )
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404
 
    sub.delete_instance()
 
    return jsonify({"message": f"Subscription {sub_id} deleted successfully"})
