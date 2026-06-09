"""Booking model với state machine."""
import uuid

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from .state_machine import validate_transition


class BookingManager(models.Manager):
    def create_booking(
        self,
        customer,
        therapist,
        treatment,
        timeslot,
        address,
        contact_phone,
        total_amount,
        note="",
    ):
        """Tạo booking mới với code tự sinh và book timeslot."""
        # Tự sinh booking code
        last = self.order_by("-pk").first()
        next_num = (int(last.code.split("-")[1]) + 1) if last else 1
        code = f"JVJ-{next_num:04d}"

        booking = self.create(
            code=code,
            customer=customer,
            therapist=therapist,
            treatment=treatment,
            timeslot=timeslot,
            address=address,
            contact_phone=contact_phone,
            total_amount=total_amount,
            note=note,
            status="pending",
            payment_status="unpaid",
        )

        # Book timeslot
        timeslot.book()
        return booking


class Booking(models.Model):
    """Booking — đơn đặt lịch dịch vụ chăm sóc tại nhà."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("rejected", "Rejected"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("unpaid", "Unpaid"),
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True, editable=False)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="customer_bookings",
    )
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="therapist_bookings",
    )
    treatment = models.ForeignKey(
        "treatments.Treatment",
        on_delete=models.PROTECT,
    )
    timeslot = models.ForeignKey(
        "timeslots.TimeSlot",
        on_delete=models.PROTECT,
        related_name="bookings",
    )
    address = models.TextField()
    contact_phone = models.CharField(max_length=20)
    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        validators=[MinValueValidator(1)],
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS_CHOICES,
        default="unpaid",
    )
    note = models.TextField(blank=True, default="")
    rejection_reason = models.TextField(blank=True, default="")
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = BookingManager()

    class Meta:
        db_table = "bookings_booking"
        indexes = [
            models.Index(fields=["customer"]),
            models.Index(fields=["therapist"]),
            models.Index(fields=["status"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["code"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.code} — {self.customer.email} → {self.therapist.email}"

    def transition(self, action: str, actor_role: str, actor, reason: str = ""):
        """Chuyển trạng thái booking theo state machine."""
        new_status = validate_transition(action, actor_role, self.status)
        old_status = self.status

        update_fields = ["status", "updated_at"]

        if new_status == "confirmed":
            self.confirmed_at = timezone.now()
            update_fields.append("confirmed_at")
        elif new_status == "completed":
            self.completed_at = timezone.now()
            update_fields.append("completed_at")
        elif new_status in ("cancelled", "rejected"):
            self.cancelled_at = timezone.now()
            update_fields.append("cancelled_at")
            if reason:
                self.rejection_reason = reason
                update_fields.append("rejection_reason")
            # Giải phóng timeslot
            if self.timeslot.status == "booked":
                self.timeslot.release()

        self.status = new_status
        self.save(update_fields=update_fields)
        return self

    def can_cancel(self, user) -> bool:
        if user.role == "admin":
            return self.status in ("pending", "confirmed", "in_progress")
        if user.role == "customer" and self.customer_id == user.id:
            return self.status in ("pending", "confirmed")
        return False
