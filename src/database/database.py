from peewee import Model, PostgresqlDatabase

import os
from dotenv import load_dotenv

load_dotenv()

db = PostgresqlDatabase(
    os.getenv("PGDATABASE"),
    user=os.getenv("PGUSER"),
    password=os.getenv("PGPASSWORD"),
    host=os.getenv("PGHOST"),
    port=os.getenv("PGPORT"),
    sslmode="require"
)

class BaseModel(Model):
    class Meta:
        database = db
