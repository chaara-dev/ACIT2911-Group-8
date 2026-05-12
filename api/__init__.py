from flask import Flask

from flask_login import LoginManager

from database.database import db
from database.models import User, Subscription, Payment


def create_app():
    app = Flask(
        __name__,
        template_folder="../templates",
        static_folder="../static"
    )

    @app.before_request
    def before_request():
        db.connect(reuse_if_open=True)
    
    @app.teardown_appcontext
    def teardown(exc):
        if not db.is_closed():
            db.close()
    
    db.connect()
    db.create_tables([User, Subscription, Payment])
    db.close()

    from api.views import views_bp
    app.register_blueprint(views_bp)

    from api.subscriptions import subscriptions_bp
    app.register_blueprint(subscriptions_bp, url_prefix="/api")

    from api.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api")

    return app
