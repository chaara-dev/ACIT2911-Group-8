from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from peewee import IntegrityError, DoesNotExist

from database.models import User


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