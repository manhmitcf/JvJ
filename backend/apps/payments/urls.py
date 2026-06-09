"""URL routes cho Payment app."""
from django.urls import path

from . import views

urlpatterns = [
    path("<uuid:booking_id>/initiate/", views.PaymentInitiateView.as_view(), name="payment-initiate"),
    path("<uuid:booking_id>/", views.PaymentDetailView.as_view(), name="payment-detail"),
    path("<uuid:booking_id>/timeline/", views.PaymentTimelineView.as_view(), name="payment-timeline"),
    path("<uuid:booking_id>/simulate/", views.PaymentSimulateView.as_view(), name="payment-simulate"),
    path("<uuid:booking_id>/refund/", views.PaymentRefundView.as_view(), name="payment-refund"),
]
