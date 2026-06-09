"""TherapistProfile model — extends User with professional details."""
import uuid

from django.conf import settings
from django.db import models


class TherapistProfile(models.Model):
    """Professional profile for therapist users."""

    STATUS_CHOICES = [
        ("pending_approval", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("suspended", "Suspended"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="therapist_profile",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending_approval",
    )
    years_of_experience = models.IntegerField(default=0)
    specialties = models.JSONField(default=list)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    completed_bookings = models.IntegerField(default=0)
    certificate_urls = models.JSONField(default=list)

    # Thông tin CCCD và file uploads
    citizen_id = models.CharField(
        max_length=12,
        blank=True,
        default="",
        db_index=True,
        help_text="Số CCCD 12 chữ số"
    )
    portrait_url = models.URLField(blank=True, default="", help_text="URL ảnh chân dung")
    citizen_id_front_url = models.URLField(blank=True, default="", help_text="URL ảnh CCCD mặt trước")
    citizen_id_back_url = models.URLField(blank=True, default="", help_text="URL ảnh CCCD mặt sau")

    # Thông tin phục vụ
    service_areas = models.JSONField(default=list, help_text="Khu vực phục vụ tại Đà Nẵng")
    has_transport = models.BooleanField(default=False, help_text="Có phương tiện di chuyển")
    has_equipment = models.BooleanField(default=False, help_text="Có dụng cụ hành nghề")

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="reviewed_therapists",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, default="")
    is_online = models.BooleanField(default=False, help_text="Trạng thái online")
    bio = models.TextField(blank=True, default="", help_text="Giới thiệu bản thân")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "therapists_therapistprofile"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["rating"]),
        ]

    def __str__(self):
        return str(self.user.email)

    @property
    def is_approved(self):
        return self.status == "approved"
