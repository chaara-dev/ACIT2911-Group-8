import os

from dotenv import load_dotenv
from flask import Flask
from flask_login import LoginManager

from src.database.database import db
from src.database.models import User, Subscription, Payment, RenewalReminder


def create_app():
    load_dotenv()

    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static"
    )

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    
    # Config flask-login
    login_manager = LoginManager()
    login_manager.login_view = "views.login"
    login_manager.init_app(app)

    @app.before_request
    def before_request():
        db.connect(reuse_if_open=True)
    
    @app.teardown_appcontext
    def teardown(exc):
        if not db.is_closed():
            db.close()
    
    db.connect(reuse_if_open=True)
    db.create_tables([User, Subscription, Payment, RenewalReminder])
    if not db.is_closed():
        db.close()

    @login_manager.user_loader
    def load_user(user_id):
        return User.get_by_id(int(user_id))

    # Import Blueprints
    from src.api.views import views_bp
    app.register_blueprint(views_bp)

    from src.api.subscriptions import subscriptions_bp
    app.register_blueprint(subscriptions_bp, url_prefix="/api")

    from src.api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api")

    return app
