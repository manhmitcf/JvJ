import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from apps.bookings.models import Booking

User = get_user_model()


@pytest.fixture
def completed_booking(db, user, therapist_user, treatment, timeslot):
    return Booking.objects.create(
        customer=user,
        therapist=therapist_user,
        treatment=treatment,
        timeslot=timeslot,
        address="123 Test",
        contact_phone="0901234567",
        total_amount=Decimal("300000"),
        code="JVJ-REVIEW",
        status="completed",
    )


@pytest.mark.django_db
class TestReviewModel:
    def test_create_review(self, user, therapist_user, treatment, completed_booking):
        from apps.reviews.models import Review
        review = Review.objects.create_review(
            booking=completed_booking,
            customer=user,
            therapist=therapist_user,
            treatment=treatment,
            rating=5,
            comment="Rất tốt!",
            tags=["Đúng giờ", "Tận tâm"],
        )
        assert review.pk is not None
        assert review.is_visible is True

    def test_cannot_review_pending(self, user, therapist_user, treatment, timeslot):
        from apps.reviews.models import Review
        pending = Booking.objects.create(
            customer=user,
            therapist=therapist_user,
            treatment=treatment,
            timeslot=timeslot,
            address="123 Test",
            contact_phone="0901234567",
            total_amount=Decimal("300000"),
            code="JVJ-NO-REVIEW",
            status="pending",
        )
        with pytest.raises(ValueError, match="hoàn thành"):
            Review.objects.create_review(
                booking=pending,
                customer=user,
                therapist=therapist_user,
                treatment=treatment,
                rating=4,
                comment="Test",
            )

    def test_cannot_duplicate(self, user, therapist_user, treatment, completed_booking):
        from apps.reviews.models import Review
        Review.objects.create_review(
            booking=completed_booking,
            customer=user, therapist=therapist_user,
            treatment=treatment, rating=5, comment="First",
        )
        with pytest.raises(ValueError, match="review"):
            Review.objects.create_review(
                booking=completed_booking,
                customer=user, therapist=therapist_user,
                treatment=treatment, rating=3, comment="Dup",
            )

    def test_updates_therapist_rating(self, user, therapist_user, treatment, completed_booking):
        from apps.reviews.models import Review
        assert float(therapist_user.therapist_profile.rating) == 0.0
        Review.objects.create_review(
            booking=completed_booking,
            customer=user, therapist=therapist_user,
            treatment=treatment, rating=5, comment="Excellent",
        )
        therapist_user.therapist_profile.refresh_from_db()
        assert float(therapist_user.therapist_profile.rating) == 5.0

    def test_updates_treatment_rating(self, user, therapist_user, treatment, completed_booking):
        from apps.reviews.models import Review
        assert float(treatment.rating) == 0.0
        Review.objects.create_review(
            booking=completed_booking,
            customer=user, therapist=therapist_user,
            treatment=treatment, rating=4, comment="Good",
        )
        treatment.refresh_from_db()
        assert float(treatment.rating) == 4.0
        assert treatment.review_count == 1
