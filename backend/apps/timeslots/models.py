"""TimeSlot model — availability của therapist cho treatment cụ thể."""
import uuid

from django.conf import settings
from django.db import models


class TimeSlot(models.Model):
    """Khung giờ làm việc của therapist cho một treatment."""

    STATUS_CHOICES = [
        ("available", "Available"),
        ("booked", "Booked"),
        ("disabled", "Disabled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="time_slots",
    )
    treatment = models.ForeignKey(
        "treatments.Treatment",
        on_delete=models.CASCADE,
        related_name="time_slots",
        null=True,
        blank=True,
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "timeslots_timeslot"
        indexes = [
            models.Index(fields=["therapist", "date"]),
            models.Index(fields=["status"]),
        ]
        ordering = ["date", "start_time"]
        constraints = [
            models.UniqueConstraint(
                fields=["therapist", "date", "start_time"],
                name="unique_therapist_date_start",
            ),
        ]

    def __str__(self):
        return f"{self.therapist.email} — {self.date} {self.start_time}-{self.end_time}"

    def book(self):
        """Chuyển slot sang booked."""
        if self.status != "available":
            raise ValueError(f"Cannot book slot with status '{self.status}'")
        self.status = "booked"
        self.save(update_fields=["status", "updated_at"])

    def release(self):
        """Giải phóng slot về available."""
        if self.status != "booked":
            raise ValueError(f"Cannot release slot with status '{self.status}'")
        self.status = "available"
        self.save(update_fields=["status", "updated_at"])

    def disable(self):
        self.status = "disabled"
        self.save(update_fields=["status", "updated_at"])

    def enable(self):
        if self.status == "booked":
            raise ValueError("Cannot enable a booked slot")
        self.status = "available"
        self.save(update_fields=["status", "updated_at"])

    def overlaps_with(self, other: "TimeSlot") -> bool:
        """Kiểm tra overlap với slot khác cùng therapist cùng ngày."""
        if self.therapist_id != other.therapist_id:
            return False
        if self.date != other.date:
            return False
        return self.start_time < other.end_time and other.start_time < self.end_time
