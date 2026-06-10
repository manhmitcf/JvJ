"""URL routes for treatment endpoints."""
from django.urls import path

from .views import TreatmentAvailableSlotsAPIView, TreatmentDetailAPIView, TreatmentListAPIView

urlpatterns = [
    path("", TreatmentListAPIView.as_view(), name="treatment-list"),
    path("<uuid:id>/", TreatmentDetailAPIView.as_view(), name="treatment-detail"),
    path("<uuid:id>/available-slots/", TreatmentAvailableSlotsAPIView.as_view(), name="treatment-available-slots"),
]
