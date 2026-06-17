"""Payment và PaymentTimeline models."""
import uuid

from django.db import models
from django.utils import timezone


class Payment(models.Model):
    """Payment record cho một booking."""

    METHOD_CHOICES = [
        ("vnpay_qr", "VNPAY QR"),
        ("vnpay_card", "VNPAY Card"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name="payment",
    )
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=0)
    vnpay_transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    vnpay_response_code = models.CharField(max_length=10, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "payments_payment"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Payment {self.booking.code} — {self.status}"

    def mark_success(self, transaction_id: str = ""):
        self.status = "success"
        self.vnpay_transaction_id = transaction_id or f"VNPAY-{uuid.uuid4().hex[:12].upper()}"
        self.vnpay_response_code = "00"
        self.completed_at = timezone.now()
        self.save(update_fields=["status", "vnpay_transaction_id", "vnpay_response_code", "completed_at"])

        # Sync booking payment_status
        self.booking.payment_status = "paid"
        self.booking.save(update_fields=["payment_status", "updated_at"])

    def mark_failed(self, response_code: str = "24"):
        self.status = "failed"
        self.vnpay_response_code = response_code
        self.save(update_fields=["status", "vnpay_response_code"])

        self.booking.payment_status = "failed"
        self.booking.save(update_fields=["payment_status", "updated_at"])


class PaymentTimeline(models.Model):
    """Bất biến — append only log của payment events."""

    TONE_CHOICES = [
        ("neutral", "Neutral"),
        ("success", "Success"),
        ("warning", "Warning"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="timeline",
    )
    label = models.CharField(max_length=255)
    tone = models.CharField(max_length=20, choices=TONE_CHOICES, default="neutral")
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payments_paymenttimeline"
        ordering = ["occurred_at"]

    def __str__(self):
        return f"[{self.tone}] {self.label}"
