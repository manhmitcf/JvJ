"""Notification model."""
import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    """Thông báo cho người dùng."""

    TYPE_CHOICES = [
        ("booking_created", "Booking created"),
        ("booking_confirmed", "Booking confirmed"),
        ("booking_rejected", "Booking rejected"),
        ("booking_cancelled", "Booking cancelled"),
        ("booking_completed", "Booking completed"),
        ("booking_in_progress", "Booking in progress"),
        ("payment_pending", "Payment pending"),
        ("payment_success", "Payment success"),
        ("payment_failed", "Payment failed"),
        ("payment_refunded", "Payment refunded"),
        ("therapist_approved", "Therapist approved"),
        ("therapist_rejected", "Therapist rejected"),
        ("therapist_new_application", "New therapist application"),
        ("therapist_credential_update", "Credential update request"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=40, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    data = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications_notification"
        indexes = [
            models.Index(fields=["recipient", "is_read", "-created_at"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.notification_type} → {self.recipient.email}"
