"""Tests cho Booking API endpoints."""
import pytest
from datetime import date, time
from decimal import Decimal
from rest_framework import status

from apps.bookings.models import Booking
from apps.timeslots.models import TimeSlot


def create_timeslot(therapist, treatment, day=10, hour=9, **overrides):
    data = {
        "therapist": therapist,
        "treatment": treatment,
        "date": date(2026, 6, day),
        "start_time": time(hour, 0),
        "end_time": time(hour + 1, 0),
    }
    data.update(overrides)
    return TimeSlot.objects.create(**data)


# Base paths — routes include tại /api/v1/bookings/
BOOKING_BASE = "/api/v1/bookings"


@pytest.mark.django_db
class TestBookingCreate:
    def test_customer_can_create_booking(self, auth_client, user, therapist_user, treatment):
        timeslot = create_timeslot(therapist_user, treatment)

        response = auth_client.post(f"{BOOKING_BASE}/create/", {
            "timeslot_id": str(timeslot.id),
            "treatment_id": str(treatment.id),
            "therapist_id": str(therapist_user.id),
            "address": "123 Nguyễn Huệ, Đà Nẵng",
            "contact_phone": "0901234567",
        }, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()["data"]
        assert data["status"] == "pending"
        assert data["payment_status"] == "unpaid"

        timeslot.refresh_from_db()
        assert timeslot.status == "booked"

    def test_cannot_book_unavailable_slot(self, auth_client, therapist_user, treatment):
        timeslot = create_timeslot(therapist_user, treatment, status="booked")

        response = auth_client.post(f"{BOOKING_BASE}/create/", {
            "timeslot_id": str(timeslot.id),
            "treatment_id": str(treatment.id),
            "therapist_id": str(therapist_user.id),
            "address": "123 Nguyễn Huệ",
            "contact_phone": "0901234567",
        }, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_guest_cannot_create_booking(self, client, therapist_user, treatment):
        timeslot = create_timeslot(therapist_user, treatment)

        response = client.post(f"{BOOKING_BASE}/create/", {
            "timeslot_id": str(timeslot.id),
            "treatment_id": str(treatment.id),
            "therapist_id": str(therapist_user.id),
            "address": "123 Nguyễn Huệ",
            "contact_phone": "0901234567",
        }, format="json")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestBookingList:
    def test_customer_sees_own_bookings(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()

        response = auth_client.get(f"{BOOKING_BASE}/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["results"]) == 1

    def test_therapist_sees_own_bookings(self, therapist_client, therapist_user, booking):
        booking.therapist_id = therapist_user.id
        booking.save()

        response = therapist_client.get(f"{BOOKING_BASE}/therapist/bookings/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["results"]) == 1


@pytest.mark.django_db
class TestBookingCancel:
    def test_customer_can_cancel_pending(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.save()

        response = auth_client.post(f"{BOOKING_BASE}/{booking.id}/cancel/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["status"] == "cancelled"

    def test_cannot_cancel_completed(self, auth_client, user, booking):
        booking.customer_id = user.id
        booking.status = "completed"
        booking.save()

        response = auth_client.post(f"{BOOKING_BASE}/{booking.id}/cancel/")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_cannot_cancel_others_booking(self, auth_client, user_factory, user, booking):
        # booking belongs to conftest's `user`, make auth_client use a different customer
        other = user_factory(email="other@cust.com", full_name="Other", role="customer", password="testpass123")
        # Re-auth auth_client with different user — easier: just use a fresh client
        from rest_framework.test import APIClient
        from rest_framework_simplejwt.tokens import RefreshToken
        api_client = APIClient()
        refresh = RefreshToken.for_user(other)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        response = api_client.post(f"{BOOKING_BASE}/{booking.id}/cancel/")

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestTherapistBookingActions:
    def test_therapist_can_confirm(self, therapist_client, therapist_user, booking):
        booking.therapist_id = therapist_user.id
        booking.save()

        response = therapist_client.post(f"{BOOKING_BASE}/therapist/bookings/{booking.id}/confirm/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["status"] == "confirmed"

    def test_therapist_can_reject(self, therapist_client, therapist_user, booking):
        booking.therapist_id = therapist_user.id
        booking.save()

        response = therapist_client.post(
            f"{BOOKING_BASE}/therapist/bookings/{booking.id}/reject/",
            {"reason": "Hết lịch"},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["status"] == "rejected"
        assert data["rejection_reason"] == "Hết lịch"

    def test_therapist_can_start(self, therapist_client, therapist_user, booking):
        booking.therapist_id = therapist_user.id
        booking.status = "confirmed"
        booking.save()

        response = therapist_client.post(f"{BOOKING_BASE}/therapist/bookings/{booking.id}/start/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["status"] == "in_progress"

    def test_cannot_start_pending_booking(self, therapist_client, therapist_user, booking):
        """pending → in_progress = invalid transition."""
        booking.therapist_id = therapist_user.id
        booking.status = "pending"
        booking.save()

        response = therapist_client.post(f"{BOOKING_BASE}/therapist/bookings/{booking.id}/start/")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_therapist_can_complete(self, therapist_client, therapist_user, booking):
        booking.therapist_id = therapist_user.id
        booking.status = "in_progress"
        booking.save()

        response = therapist_client.post(f"{BOOKING_BASE}/therapist/bookings/{booking.id}/complete/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["status"] == "completed"

    def test_invalid_action_returns_400(self, therapist_client, therapist_user, booking):
        booking.therapist_id = therapist_user.id
        booking.save()

        response = therapist_client.post(f"{BOOKING_BASE}/therapist/bookings/{booking.id}/invalid_action/")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_therapist_cannot_act_on_others_booking(self, therapist_client, user_factory, therapist_user, booking):
        # booking belongs to therapist_user, override to another therapist
        other = user_factory(email="other@therapist.com", full_name="Other", role="therapist", password="testpass123")
        booking.therapist = other
        booking.save()

        response = therapist_client.post(f"{BOOKING_BASE}/therapist/bookings/{booking.id}/confirm/")

        assert response.status_code == status.HTTP_404_NOT_FOUND
