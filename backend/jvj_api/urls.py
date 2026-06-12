"""Root URL configuration for JvJ API."""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.users.urls")),
    path("api/v1/therapists/", include("apps.therapists.urls")),
    path("api/v1/treatments/", include("apps.treatments.urls")),
    path("api/v1/spas/", include("apps.spas.urls")),
    path("api/v1/timeslots/", include("apps.timeslots.urls")),
    path("api/v1/bookings/", include("apps.bookings.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/reviews/", include("apps.reviews.urls")),
    path("api/v1/admin/", include("apps.admin.urls")),
    path("api/v1/conversations/", include("apps.conversations.urls")),
    path("api/v1/", include("apps.common.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
