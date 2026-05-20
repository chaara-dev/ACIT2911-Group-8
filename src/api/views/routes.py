from flask import render_template
from flask_login import login_required

from . import views_bp


@views_bp.route("/")
@login_required
def index():
    return render_template("index.html")


@views_bp.route("/signup")
def signup():
    return render_template("signup.html")


@views_bp.route("/login")
def login():
    return render_template("login.html")


@views_bp.route("/subscription-create")
@login_required
def subscription_create():
    return render_template("subscription-create.html")


@views_bp.route("/subscription-view")
@login_required
def subscription_view():
    return render_template("subscription-view.html")


@views_bp.route("/subscription-edit")
@login_required
def subscription_edit():
    return render_template("subscription-edit.html")
