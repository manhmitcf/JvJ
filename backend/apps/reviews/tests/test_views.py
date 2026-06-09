import pytest
from decimal import Decimal
from rest_framework import status
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
        code="JVJ-REVIEW-V",
        status="completed",
    )


@pytest.mark.django_db
class TestReviewViews:
    def test_create_review(self, auth_client, treatment, completed_booking):
        response = auth_client.post("/api/v1/reviews/", {
            "booking_id": str(completed_booking.id),
            "treatment_id": str(treatment.id),
            "rating": 5,
            "comment": "Rất tuyệt!",
            "tags": ["Đúng giờ"],
        }, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()["data"]["rating"] == 5

    def test_cannot_review_non_completed(self, auth_client, booking):
        response = auth_client.post("/api/v1/reviews/", {
            "booking_id": str(booking.id),
            "treatment_id": str(booking.treatment_id),
            "rating": 4, "comment": "Test",
        }, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cannot_duplicate(self, auth_client, user, therapist_user, treatment, completed_booking):
        from apps.reviews.models import Review
        Review.objects.create_review(
            booking=completed_booking, customer=user,
            therapist=therapist_user, treatment=treatment,
            rating=5, comment="First",
        )
        response = auth_client.post("/api/v1/reviews/", {
            "booking_id": str(completed_booking.id),
            "treatment_id": str(treatment.id),
            "rating": 3, "comment": "Dup",
        }, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_therapist_reviews(self, client, therapist_user, user, treatment, completed_booking):
        from apps.reviews.models import Review
        Review.objects.create_review(
            booking=completed_booking, customer=user,
            therapist=therapist_user, treatment=treatment,
            rating=5, comment="Good",
        )
        response = client.get(f"/api/v1/reviews/therapists/{therapist_user.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()["data"]["results"]) == 1

    def test_get_treatment_reviews(self, client, therapist_user, user, treatment, completed_booking):
        from apps.reviews.models import Review
        Review.objects.create_review(
            booking=completed_booking, customer=user,
            therapist=therapist_user, treatment=treatment,
            rating=4, comment="Nice",
        )
        response = client.get(f"/api/v1/reviews/treatments/{treatment.id}/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()["data"]["results"]) == 1
