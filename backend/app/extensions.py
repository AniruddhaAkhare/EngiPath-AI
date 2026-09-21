"""
EngiPath AI — Flask Extensions

Extensions are instantiated here (without app) and initialized
inside create_app() to support the Application Factory pattern.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
