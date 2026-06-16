"""Treatment model — dịch vụ do therapist cung cấp."""
import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Treatment(models.Model):
    """Dịch vụ điều trị/massage do therapist cung cấp."""

    CATEGORY_CHOICES = [
        ("Cổ vai gáy", "Cổ vai gáy"),
        ("Vật lý trị liệu", "Vật lý trị liệu"),
        ("Phục hồi chức năng", "Phục hồi chức năng"),
        ("Ấn huyệt", "Ấn huyệt"),
        ("Đông y", "Đông y"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    therapist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="treatments",
    )
    spa = models.ForeignKey(
        "spas.Spa",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="treatments",
    )
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    description = models.TextField()
    price = models.DecimalField(
        max_digits=10,
        decimal_places=0,
        validators=[MinValueValidator(Decimal("1"))],
    )
    duration_minutes = models.PositiveIntegerField()
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)
    review_count = models.IntegerField(default=0)
    images = models.JSONField(default=list, help_text="Array of image URLs, max 5. First image is the main image.")
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "treatments_treatment"
        indexes = [
            models.Index(fields=["therapist"]),
            models.Index(fields=["category"]),
            models.Index(fields=["is_available"]),
            models.Index(fields=["rating"]),
        ]
        ordering = ["-rating", "-created_at"]

    def __str__(self):
        return self.name

    @property
    def image_url(self):
        """Backward compatibility: return first image as main image."""
        return self.images[0] if self.images else ""

    def soft_delete(self):
        """Xóa mềm bằng cách đặt is_available=False."""
        self.is_available = False
        self.save(update_fields=["is_available", "updated_at"])

    def update_rating(self):
        """Tính lại rating từ reviews (deferred import để tránh lỗi khi app reviews chưa có)."""
        try:
            from apps.reviews.models import Review
        except ModuleNotFoundError:
            return
        agg = Review.objects.filter(
            treatment=self,
            is_visible=True,
        ).aggregate(
            avg_rating=models.Avg("rating"),
            count=models.Count("id"),
        )
        self.rating = agg["avg_rating"] or 0.0
        self.review_count = agg["count"] or 0
        self.save(update_fields=["rating", "review_count", "updated_at"])
