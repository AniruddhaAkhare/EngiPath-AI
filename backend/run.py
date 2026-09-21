"""
EngiPath AI — Development Entry Point
"""
import os
from dotenv import load_dotenv

# Load environment variables before importing app
load_dotenv()

from app import create_app

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    print(f"[EngiPath AI] Starting development server on http://0.0.0.0:{port}")
    print(f"[EngiPath AI] Swagger UI: http://localhost:{port}/swagger")
    app.run(host="0.0.0.0", port=port, debug=debug)
