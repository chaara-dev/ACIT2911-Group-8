from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from peewee import IntegrityError, DoesNotExist

from database.models import User , Subscription

# Auth (Nathan's code)
api = Blueprint("api", __name__)


@api.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    try:
        user = User.create(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )

        return jsonify({
            "message": "User registered successfully",
            "user": user.to_dict()
        }), 201

    except IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409


@api.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    try:
        user = User.get(User.email == email)

        if not check_password_hash(user.password_hash, password):
            return jsonify({"error": "Invalid email or password"}), 401

        return jsonify({
            "message": "Login successful",
            "user": user.to_dict()
        }), 200

    except DoesNotExist:
        return jsonify({"error": "Invalid email or password"}), 401
    

# Subscription CRUD (Leon's code)

@api.route("/subscriptions", methods=["GET"])
def list_subscriptions():
    all_subs = Subscription.select()
 
    result = []
    for sub in all_subs:
        result.append(sub.to_dict())
 
    return jsonify({"subscriptions": result})
 
 
@api.route("/subscriptions/<int:sub_id>", methods=["GET"])
def get_subscription(sub_id):
    sub = Subscription.get_or_none(Subscription.id == sub_id)
 
    if sub is None:
        return jsonify({"error": f"Subscription {sub_id} not found"}), 404
 
    return jsonify(sub.to_dict())


@api.route("/subscriptions", methods=["POST"])
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


@api.route("/subscriptions/<int:sub_id>", methods=["PUT"])
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