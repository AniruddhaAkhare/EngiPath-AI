"""
EngiPath AI — Configuration Layer

Supports development, testing, and production environments.
All sensitive values are loaded from environment variables.
"""
import os
from typing import Optional


class BaseConfig:
    """Base configuration shared across all environments."""

    # --- Flask ---
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-production")
    JSON_SORT_KEYS: bool = False
    MAX_CONTENT_LENGTH: int = int(os.getenv("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))  # 10MB

    # --- Database ---
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///engipath.db")
    _raw_db = os.getenv("DATABASE_URL", "sqlite:///engipath.db")
    SQLALCHEMY_DATABASE_URI: str = _raw_db.replace("postgres://", "postgresql://", 1) if _raw_db.startswith("postgres://") else _raw_db
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SQLALCHEMY_ENGINE_OPTIONS: dict = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    # --- Gemini — STRICTLY SEPARATED ---
    # Classes module ONLY
    CLASSES_GEMINI_API_KEY: Optional[str] = os.getenv("CLASSES_GEMINI_API_KEY")
    CLASSES_GEMINI_MODEL: str = os.getenv("CLASSES_GEMINI_MODEL", "gemini-2.5-flash")

    # Internship + Resume module ONLY
    INTERNSHIP_GEMINI_API_KEY: Optional[str] = os.getenv("INTERNSHIP_GEMINI_API_KEY")
    INTERNSHIP_GEMINI_MODEL: str = os.getenv("INTERNSHIP_GEMINI_MODEL", "gemini-flash-latest")

    # --- Web Search ---
    SEARCH_API_KEY: Optional[str] = os.getenv("SEARCH_API_KEY")
    SEARCH_ENGINE_ID: Optional[str] = os.getenv("SEARCH_ENGINE_ID")

    # --- Maps (all free) ---
    NOMINATIM_URL: str = os.getenv("NOMINATIM_URL", "https://nominatim.openstreetmap.org")
    NOMINATIM_USER_AGENT: str = os.getenv("NOMINATIM_USER_AGENT", "EngiPathAI/1.0")
    NOMINATIM_RATE_LIMIT_SECONDS: float = float(os.getenv("NOMINATIM_RATE_LIMIT_SECONDS", "1.0"))
    OSRM_URL: str = os.getenv("OSRM_URL", "https://router.project-osrm.org")
    OVERPASS_URL: str = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter")

    # --- CORS ---
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "*")

    # --- File Uploads ---
    UPLOAD_FOLDER: str = os.getenv("UPLOAD_FOLDER", "uploads")
    ALLOWED_EXTENSIONS: set = {"pdf", "docx"}
    DELETE_RESUME_AFTER_ANALYSIS: bool = os.getenv("DELETE_RESUME_AFTER_ANALYSIS", "true").lower() == "true"

    # --- Scraper ---
    SCRAPER_REQUEST_TIMEOUT: int = int(os.getenv("SCRAPER_REQUEST_TIMEOUT", "15"))
    SCRAPER_MAX_RETRIES: int = int(os.getenv("SCRAPER_MAX_RETRIES", "3"))

    # --- Logging ---
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # --- Search results target ---
    CLASS_SEARCH_TARGET_RESULTS: int = 10
    INTERNSHIP_SEARCH_TARGET_RESULTS: int = 10


class DevelopmentConfig(BaseConfig):
    """Development environment configuration."""
    DEBUG: bool = True
    TESTING: bool = False
    SQLALCHEMY_ECHO: bool = False


class TestingConfig(BaseConfig):
    """Testing environment configuration."""
    DEBUG: bool = False
    TESTING: bool = True
    SQLALCHEMY_DATABASE_URI: str = "sqlite:///:memory:"
    SQLALCHEMY_ENGINE_OPTIONS: dict = {}
    WTF_CSRF_ENABLED: bool = False
    DELETE_RESUME_AFTER_ANALYSIS: bool = False


class ProductionConfig(BaseConfig):
    """Production environment configuration."""
    DEBUG: bool = False
    TESTING: bool = False
    SQLALCHEMY_ECHO: bool = False


_CONFIG_MAP = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(env: str = "development"):
    """Return the appropriate config class for the given environment name."""
    return _CONFIG_MAP.get(env, DevelopmentConfig)
