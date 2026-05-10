from flask import request, jsonify

from database.models import User , Subscription

from . import subscriptions_bp

# Subscription CRUD (Leon's code)

@subscriptions_bp.route("/subscriptions", methods=["GET"])
def list_subscriptions():
    search = request.args.get("search")
    billing_type = request.args.get("billing_type")
    sort = request.args.get("sort", "renewal_date")
    order = request.args.get("order", "desc")

    query = Subscription.select()

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
def get_subscription(sub_id):
    sub = Subscription.get_or_none(Subscription.id == sub_id)
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404
 
    return jsonify(sub.to_dict())


@subscriptions_bp.route("/subscriptions", methods=["POST"])
def create_subscription():
    data = request.get_json()
 
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
 
    user_id = data.get("user_id")
    name = data.get("name")
    cost = data.get("cost")
    billing_type = data.get("billing_type", "unknown")
 
    if not user_id or not name or cost is None:
        return jsonify({"error": "user_id, name, and cost are required"}), 400
 
    new_sub = Subscription.create(
        user=user_id,
        name=name,
        cost=cost,
        billing_type=billing_type,
    )
 
    return jsonify(new_sub.to_dict()), 201


@subscriptions_bp.route("/subscriptions/<int:sub_id>", methods=["PUT"])
def update_subscription(sub_id):
    sub = Subscription.get_or_none(Subscription.id == sub_id)
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404
 
    data = request.get_json()
 
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400
 
    name = data.get("name")
    cost = data.get("cost")
    billing_type = data.get("billing_type")
 
    if not name or cost is None or not billing_type:
        return jsonify({"error": "name, cost, and billing_type are required"}), 400
 
    sub.name = name
    sub.cost = cost
    sub.billing_type = billing_type
    sub.save()
 
    return jsonify(sub.to_dict())

@subscriptions_bp.route("/subscriptions/<int:sub_id>", methods=["DELETE"])
def delete_subscription(sub_id):
    sub = Subscription.get_or_none(Subscription.id == sub_id)
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404
 
    sub.delete_instance()
 
    return jsonify({"message": f"Subscription {sub_id} deleted successfully"})
