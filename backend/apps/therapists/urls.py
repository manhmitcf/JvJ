"""URL routes cho therapist endpoints."""
from django.urls import path

from .views import (
    TherapistApplyStatusView,
    TherapistApplyView,
    TherapistDashboardView,
    TherapistDetailAPIView,
    TherapistListAPIView,
    TherapistOnlineToggleView,
    TherapistProfileView,
    TherapistTreatmentsAPIView,
    upload_therapist_documents,
)

urlpatterns = [
    # Static routes TRƯỚC <uuid:id> — quan trọng để Django match đúng
    path("dashboard/", TherapistDashboardView.as_view(), name="therapist-dashboard"),
    path("profile/status/", TherapistOnlineToggleView.as_view(), name="therapist-online-toggle"),
    path("profile/", TherapistProfileView.as_view(), name="therapist-profile"),
    path("apply/", TherapistApplyView.as_view(), name="therapist-apply"),
    path("apply/status/", TherapistApplyStatusView.as_view(), name="therapist-apply-status"),
    path("upload/documents/", upload_therapist_documents, name="therapist-upload-documents"),
    path("", TherapistListAPIView.as_view(), name="therapist-list"),
    path("<uuid:id>/", TherapistDetailAPIView.as_view(), name="therapist-detail"),
    path("<uuid:id>/treatments/", TherapistTreatmentsAPIView.as_view(), name="therapist-treatments"),
]
