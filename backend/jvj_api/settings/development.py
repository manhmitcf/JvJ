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

# Silence Docker volume warnings
if "django.contrib.staticfiles" in INSTALLED_APPS:  # noqa: F405
    INSTALLED_APPS.remove("django.contrib.staticfiles")  # noqa: F405
