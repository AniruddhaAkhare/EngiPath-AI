"""
EngiPath AI — Application Factory

Creates and configures the Flask application instance.
"""
import os
import logging
from flask import Flask
from flasgger import Swagger

from .config import get_config
from .extensions import db, migrate, cors


def create_app(env: str = None) -> Flask:
    """
    Application Factory — creates and configures a Flask app instance.

    Args:
        env: Environment name ('development', 'testing', 'production').
             Falls back to FLASK_ENV env var, then 'development'.
    """
    if env is None:
        env = os.getenv("FLASK_ENV", "development")

    app = Flask(__name__)

    # Load config
    config_class = get_config(env)
    app.config.from_object(config_class)

    # Ensure upload folder exists
    os.makedirs(app.config.get("UPLOAD_FOLDER", "uploads"), exist_ok=True)

    # Initialize extensions
    _init_extensions(app)

    # Register blueprints
    _register_blueprints(app)

    # Register error handlers
    _register_error_handlers(app)

    # Configure logging
    _configure_logging(app)

    # Configure Swagger
    _configure_swagger(app)

    # Initialize database tables
    _init_database(app)

    return app


def _init_extensions(app: Flask) -> None:
    """Initialize Flask extensions."""
    db.init_app(app)
    migrate.init_app(app, db)

    # Parse CORS origins
    origins = app.config.get("CORS_ORIGINS", "*")
    if origins != "*":
        origins = [o.strip() for o in origins.split(",")]
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"],
            }
        },
    )

def _init_database(app: Flask) -> None:
    """Import all models and ensure database tables exist."""
    if not app.config.get("TESTING", False):
        with app.app_context():
            try:
                from . import models  # noqa: F401
                db.create_all()
                app.logger.info("Database tables verified and ready.")
            except Exception as e:
                app.logger.warning("Could not automatically create database tables: %s", e)


def _register_blueprints(app: Flask) -> None:
    """Register all API blueprints."""
    from .api.health.routes import health_bp
    from .api.classes.routes import classes_bp
    from .api.internships.routes import internships_bp
    from .api.resume.routes import resume_bp
    from .api.maps.routes import maps_bp
    from .api.auth.routes import auth_bp

    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(classes_bp, url_prefix="/api/v1/classes")
    app.register_blueprint(internships_bp, url_prefix="/api/v1/internships")
    app.register_blueprint(resume_bp, url_prefix="/api/v1/resume")
    app.register_blueprint(maps_bp, url_prefix="/api/v1/maps")
    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")


def _register_error_handlers(app: Flask) -> None:
    """Register global error handlers."""
    from .middleware.error_handler import (
        handle_400, handle_404, handle_413, handle_422, handle_500
    )
    app.register_error_handler(400, handle_400)
    app.register_error_handler(404, handle_404)
    app.register_error_handler(413, handle_413)
    app.register_error_handler(422, handle_422)
    app.register_error_handler(500, handle_500)


def _configure_logging(app: Flask) -> None:
    """Configure structured logging."""
    level = getattr(logging, app.config.get("LOG_LEVEL", "INFO").upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    app.logger.setLevel(level)


def _configure_swagger(app: Flask) -> None:
    """Configure Flasgger Swagger UI."""
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": "apispec",
                "route": "/apispec.json",
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/swagger/",
    }
    swagger_template = {
        "swagger": "2.0",
        "info": {
            "title": "EngiPath AI API",
            "description": (
                "Production backend for EngiPath AI — Discover. Learn. Intern. Grow.\n\n"
                "## Modules\n"
                "- **Class Finder**: Discover live courses/institutes for any course + location\n"
                "- **Internship Recommender**: AI-powered internship recommendations + live discovery\n\n"
                "## Notes\n"
                "- All data is retrieved live from the web; no mock/seeded data\n"
                "- Two separate Gemini API keys are used (classes vs internships)\n"
            ),
            "version": "1.0.0",
            "contact": {"email": "support@engipath.ai"},
        },
        "basePath": "/",
        "schemes": ["http", "https"],
        "consumes": ["application/json"],
        "produces": ["application/json"],
        "tags": [
            {"name": "Health", "description": "Health check"},
            {"name": "Classes", "description": "Class/Course Finder"},
            {"name": "Internships", "description": "Internship Recommendations"},
            {"name": "Resume", "description": "Resume Upload & Analysis"},
            {"name": "Maps", "description": "Geocoding & Routing"},
        ],
    }
    Swagger(app, config=swagger_config, template=swagger_template)
