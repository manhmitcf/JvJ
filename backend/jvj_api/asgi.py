"""ASGI config for JvJ API."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "jvj_api.settings.development")

application = get_asgi_application()
