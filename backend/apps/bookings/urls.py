"""URL routes cho Booking app."""
from django.urls import path

from . import views

urlpatterns = [
    # Customer
    path("", views.CustomerBookingListView.as_view(), name="customer-booking-list"),
    path("create/", views.BookingCreateView.as_view(), name="booking-create"),
    # Therapist — đặt TRƯỚC <uuid:id>/ patterns
    path("therapist/bookings/", views.TherapistBookingListView.as_view(), name="therapist-booking-list"),
    path("therapist/bookings/<uuid:id>/<str:action>/", views.TherapistBookingActionView.as_view(), name="therapist-booking-action"),
    # Generic — sau cùng
    path("<uuid:id>/", views.BookingDetailAPIView.as_view(), name="booking-detail"),
    path("<uuid:id>/cancel/", views.BookingCancelView.as_view(), name="booking-cancel"),
]
