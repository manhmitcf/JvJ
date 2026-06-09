"""URL routes cho TimeSlot app."""
from django.urls import path

from . import views

urlpatterns = [
    # Public
    path("", views.TimeSlotListAPIView.as_view(), name="timeslot-list"),
    path("<uuid:id>/", views.TimeSlotDetailAPIView.as_view(), name="timeslot-detail"),
    # Therapist routes — phải đặt TRƯỚC pattern có generic segments
    path("therapist/timeslots/bulk/", views.TherapistBulkTimeSlotView.as_view(), name="therapist-timeslot-bulk"),
    path("therapist/timeslots/create/", views.TherapistTimeSlotCreateView.as_view(), name="therapist-timeslot-create"),
    path("therapist/timeslots/", views.TherapistTimeSlotListAPIView.as_view(), name="therapist-timeslot-list"),
    path("therapist/timeslots/<uuid:id>/", views.TherapistTimeSlotUpdateView.as_view(), name="therapist-timeslot-update"),
    path("therapist/timeslots/<uuid:id>/delete/", views.TherapistTimeSlotDeleteView.as_view(), name="therapist-timeslot-delete"),
]
