from flask import Flask

from database.database import db
from database.models import User, Subscription, Payment


def create_app():
    app = Flask(__name__)

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

    return app
