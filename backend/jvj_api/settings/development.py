"""Development settings — overrides for local development."""
from .base import *  # noqa: F401,F403

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "*"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# DATABASES uses DATABASE_URL from .env (configured in base.py via decouple)
# No override — Supabase connection comes from .env

# Media files - use local persistent folder for development
MEDIA_ROOT = BASE_DIR / "media"  # noqa: F405
