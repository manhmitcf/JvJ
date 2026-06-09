"""URL routes cho spa endpoints."""
from django.urls import path

from .views import (
    SpaDetailAPIView,
    SpaDistanceAPIView,
    SpaListAPIView,
    SpaNearbyAPIView,
    SpaTreatmentsAPIView,
)

urlpatterns = [
    path("", SpaListAPIView.as_view(), name="spa-list"),
    path("nearby/", SpaNearbyAPIView.as_view(), name="spa-nearby"),
    path("<uuid:id>/", SpaDetailAPIView.as_view(), name="spa-detail"),
    path("<uuid:id>/treatments/", SpaTreatmentsAPIView.as_view(), name="spa-treatments"),
    path("<uuid:id>/distance/", SpaDistanceAPIView.as_view(), name="spa-distance"),
]
