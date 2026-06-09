"""Tests cho Booking model."""
import pytest
from datetime import date, time
from decimal import Decimal

from apps.bookings.models import Booking
from apps.bookings.state_machine import InvalidTransitionError
from apps.timeslots.models import TimeSlot


@pytest.mark.django_db
class TestBookingModel:
    def test_create_booking(self, user, therapist_user, treatment, timeslot):
        booking = Booking.objects.create_booking(
            customer=user,
            therapist=therapist_user,
            treatment=treatment,
            timeslot=timeslot,
            address="123 Nguyễn Huệ, Đà Nẵng",
            contact_phone="0901234567",
            total_amount=Decimal("350000"),
        )

        assert booking.code.startswith("JVJ-")
        assert booking.status == "pending"
        assert booking.payment_status == "unpaid"
        timeslot.refresh_from_db()
        assert timeslot.status == "booked"

    def test_booking_code_auto_increments(self, user, therapist_user, treatment, timeslot):
        b1 = Booking.objects.create_booking(
            customer=user, therapist=therapist_user, treatment=treatment,
            timeslot=timeslot, address="Addr 1", contact_phone="0901",
            total_amount=Decimal("100000"),
        )
        timeslot2 = TimeSlot.objects.create(
            therapist=therapist_user, treatment=treatment,
            date=date(2026, 6, 11), start_time=time(9, 0), end_time=time(10, 0),
        )
        b2 = Booking.objects.create_booking(
            customer=user, therapist=therapist_user, treatment=treatment,
            timeslot=timeslot2, address="Addr 2", contact_phone="0902",
            total_amount=Decimal("200000"),
        )

        assert b1.code == "JVJ-0001"
        assert b2.code == "JVJ-0002"

    def test_transition_confirm(self, booking):
        booking.transition("confirm", "therapist", booking.therapist)
        assert booking.status == "confirmed"
        assert booking.confirmed_at is not None

    def test_transition_reject(self, booking):
        booking.transition("reject", "therapist", booking.therapist, reason="Hết lịch")
        assert booking.status == "rejected"
        assert booking.rejection_reason == "Hết lịch"

    def test_transition_cancel_releases_slot(self, booking, timeslot):
        # Ensure slot is booked
        timeslot.book()
        booking.transition("cancel", "customer", booking.customer)
        assert booking.status == "cancelled"
        timeslot.refresh_from_db()
        assert timeslot.status == "available"

    def test_invalid_transition_raises(self, booking):
        booking.transition("confirm", "therapist", booking.therapist)
        booking.transition("start", "therapist", booking.therapist)
        booking.transition("complete", "therapist", booking.therapist)

        with pytest.raises(InvalidTransitionError):
            booking.transition("cancel", "customer", booking.customer)

    def test_can_cancel_customer_pending(self, user, booking):
        booking.customer_id = user.id
        assert booking.can_cancel(user) is True

    def test_can_cancel_admin_in_progress(self, admin_user, booking):
        booking.transition("confirm", "therapist", booking.therapist)
        booking.transition("start", "therapist", booking.therapist)
        assert booking.can_cancel(admin_user) is True

    def test_cannot_cancel_therapist(self, therapist_user, booking):
        assert booking.can_cancel(therapist_user) is False

    def test_str_representation(self, booking):
        assert booking.code in str(booking)
