from django.urls import path
from .views import BookingReviewView, MyReviewsView, ReviewCreateView, TherapistReviewsView, TreatmentReviewsView

urlpatterns = [
    path("my/", MyReviewsView.as_view(), name="my-reviews"),
    path("", ReviewCreateView.as_view(), name="review-create"),
    path("bookings/<uuid:booking_id>/", BookingReviewView.as_view(), name="booking-review"),
    path("therapists/<uuid:id>/", TherapistReviewsView.as_view(), name="therapist-reviews"),
    path("treatments/<uuid:id>/", TreatmentReviewsView.as_view(), name="treatment-reviews"),
]
