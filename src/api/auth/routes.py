from flask import request, jsonify

from flask_login import login_user, logout_user, login_required

from werkzeug.security import generate_password_hash, check_password_hash

from peewee import IntegrityError, DoesNotExist
from src.database.models import User

from . import auth_bp

# Auth (Nathan's code)
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Missing JSON body"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    try:
        user = User.create(
            email=email,
            password_hash=generate_password_hash(password)
        )

        return jsonify({
            "message": "User registered successfully",
            "user": user.to_dict()
        }), 201

    except IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409


@auth_bp.route("/login", methods=["POST"])
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

        login_user(user)
        return jsonify({
            "message": "Login successful",
            "user": user.to_dict()
        }), 200

    except DoesNotExist:
        return jsonify({"error": "Invalid email or password"}), 401
    
@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200
