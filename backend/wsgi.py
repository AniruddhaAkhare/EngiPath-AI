"""
EngiPath AI — WSGI Entry Point for Production (Gunicorn)

Usage:
    gunicorn --bind 0.0.0.0:5000 --workers 4 wsgi:application

"""
import os
from dotenv import load_dotenv

load_dotenv()

from app import create_app

application = create_app(os.getenv("FLASK_ENV", "production"))
