from django.urls import path

from .views import (
    AdminStatsView,
    AdminUserListView, AdminUserDetailView, AdminUserUpdateView,
    AdminPendingTherapistsView, AdminTherapistDetailView,
    AdminTherapistApproveView, AdminTherapistRejectView,
    AdminCredentialUpdateListView, AdminCredentialUpdateDetailView,
    AdminCredentialApproveView, AdminCredentialRejectView,
    AdminBookingListView, AdminBookingDetailView, AdminBookingForceCancelView,
    AdminSpaListCreateView, AdminSpaUpdateView, AdminSpaLinkTreatmentsView,
    AdminReviewVisibilityView,
)

urlpatterns = [
    path("stats/overview/", AdminStatsView.as_view(), name="admin-stats"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<uuid:id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("users/<uuid:id>/update/", AdminUserUpdateView.as_view(), name="admin-user-update"),
    path("therapists/pending/", AdminPendingTherapistsView.as_view(), name="admin-therapists-pending"),
    path("therapists/<uuid:id>/", AdminTherapistDetailView.as_view(), name="admin-therapist-detail"),
    path("therapists/<uuid:id>/approve/", AdminTherapistApproveView.as_view(), name="admin-therapist-approve"),
    path("therapists/<uuid:id>/reject/", AdminTherapistRejectView.as_view(), name="admin-therapist-reject"),
    path("therapists/credential-updates/", AdminCredentialUpdateListView.as_view(), name="admin-credential-updates"),
    path("therapists/<uuid:id>/credential-update/", AdminCredentialUpdateDetailView.as_view(), name="admin-credential-update"),
    path("therapists/<uuid:id>/approve-credentials/", AdminCredentialApproveView.as_view(), name="admin-credential-approve"),
    path("therapists/<uuid:id>/reject-credentials/", AdminCredentialRejectView.as_view(), name="admin-credential-reject"),
    path("bookings/", AdminBookingListView.as_view(), name="admin-bookings"),
    path("bookings/<uuid:id>/", AdminBookingDetailView.as_view(), name="admin-booking-detail"),
    path("bookings/<uuid:id>/force-cancel/", AdminBookingForceCancelView.as_view(), name="admin-booking-force-cancel"),
    path("spas/", AdminSpaListCreateView.as_view(), name="admin-spas"),
    path("spas/<uuid:id>/", AdminSpaUpdateView.as_view(), name="admin-spa-detail"),
    path("spas/<uuid:id>/link-treatments/", AdminSpaLinkTreatmentsView.as_view(), name="admin-spa-link-treatments"),
    path("reviews/<uuid:id>/visibility/", AdminReviewVisibilityView.as_view(), name="admin-review-visibility"),
]
