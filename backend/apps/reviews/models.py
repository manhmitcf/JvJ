import uuid
from django.db import models


VALID_TAGS = ["Đúng giờ", "Tận tâm", "Dễ chịu", "Sạch sẽ", "Chuyên nghiệp", "Nhẹ nhàng"]


class ReviewManager(models.Manager):
    def create_review(self, booking, customer, therapist, treatment, rating, comment, tags=None):
        if booking.status != "completed":
            raise ValueError("Chỉ có thể review booking đã hoàn thành")
        if self.filter(booking=booking).exists():
            raise ValueError("Booking này đã được review")

        review = self.create(
            booking=booking, customer=customer, therapist=therapist,
            treatment=treatment, rating=rating, comment=comment, tags=tags or [],
        )
        self._update_therapist_rating(therapist)
        self._update_treatment_rating(treatment)
        return review

    def _update_therapist_rating(self, therapist):
        profile = therapist.therapist_profile
        avg = self.filter(therapist=therapist, is_visible=True).aggregate(
            avg=models.Avg("rating")
        )["avg"] or 0
        profile.rating = round(float(avg), 1)
        profile.save(update_fields=["rating"])

    def _update_treatment_rating(self, treatment):
        result = self.filter(treatment=treatment, is_visible=True).aggregate(
            avg=models.Avg("rating"), count=models.Count("id"),
        )
        treatment.rating = round(float(result["avg"] or 0), 1)
        treatment.review_count = result["count"] or 0
        treatment.save(update_fields=["rating", "review_count"])

    def update_review(self, review, rating, comment, tags=None):
        review.rating = rating
        review.comment = comment
        review.tags = tags if tags is not None else review.tags
        review.save()

        self._update_therapist_rating(review.therapist)
        self._update_treatment_rating(review.treatment)
        return review


class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField("bookings.Booking", on_delete=models.CASCADE, related_name="review")
    customer = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="reviews_written")
    therapist = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="reviews_received")
    treatment = models.ForeignKey("treatments.Treatment", on_delete=models.CASCADE, related_name="reviews")
    rating = models.PositiveSmallIntegerField(help_text="1-5")
    comment = models.TextField()
    tags = models.JSONField(default=list)
    is_visible = models.BooleanField(default=True)
    moderated_by = models.ForeignKey("users.User", null=True, on_delete=models.SET_NULL, related_name="moderated_reviews")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = ReviewManager()

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name="rating_1_to_5",
            ),
            models.UniqueConstraint(
                fields=["customer", "treatment"],
                name="unique_customer_treatment_review",
            ),
        ]

    def __str__(self):
        return f"Review {self.rating}★ cho {self.treatment.name}"
