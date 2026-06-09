from django.urls import path
from .views import ReviewCreateView, TherapistReviewsView, TreatmentReviewsView

urlpatterns = [
    path("", ReviewCreateView.as_view(), name="review-create"),
    path("therapists/<uuid:id>/", TherapistReviewsView.as_view(), name="therapist-reviews"),
    path("treatments/<uuid:id>/", TreatmentReviewsView.as_view(), name="treatment-reviews"),
]
