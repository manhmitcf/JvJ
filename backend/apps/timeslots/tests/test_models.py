"""Tests cho TimeSlot model."""
import pytest
from datetime import time, date

from apps.timeslots.models import TimeSlot


@pytest.mark.django_db
class TestTimeSlotModel:
    def test_create_timeslot(self, therapist_user, treatment):
        slot = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        assert slot.status == "available"
        assert slot.therapist == therapist_user

    def test_book_and_release(self, therapist_user, treatment):
        slot = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        slot.book()
        assert slot.status == "booked"

        with pytest.raises(ValueError, match="Cannot book"):
            slot.book()

        slot.release()
        assert slot.status == "available"

    def test_cannot_release_available_slot(self, therapist_user, treatment):
        slot = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        with pytest.raises(ValueError, match="Cannot release"):
            slot.release()

    def test_disable_and_enable(self, therapist_user, treatment):
        slot = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        slot.disable()
        assert slot.status == "disabled"

        slot.enable()
        assert slot.status == "available"

    def test_cannot_enable_booked_slot(self, therapist_user, treatment):
        slot = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        slot.book()
        with pytest.raises(ValueError, match="Cannot enable"):
            slot.enable()

    def test_overlaps_with_same_therapist(self, therapist_user, treatment):
        slot1 = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        slot2 = TimeSlot(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 30),
            end_time=time(10, 30),
        )
        assert slot1.overlaps_with(slot2) is True

    def test_no_overlap_different_day(self, therapist_user, treatment):
        slot1 = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        slot2 = TimeSlot(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 11),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        assert slot1.overlaps_with(slot2) is False

    def test_no_overlap_different_therapist(self, therapist_user, treatment):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        other_therapist = User.objects.create_user(
            email="other@therapist.com",
            full_name="Other",
            role="therapist",
            password="testpass123",
        )
        slot1 = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        slot2 = TimeSlot(
            therapist=other_therapist,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        assert slot1.overlaps_with(slot2) is False

    def test_str_representation(self, therapist_user, treatment):
        slot = TimeSlot(
            therapist=therapist_user,
            treatment=treatment,
            date=date(2026, 6, 10),
            start_time=time(9, 0),
            end_time=time(10, 0),
        )
        assert therapist_user.email in str(slot)
