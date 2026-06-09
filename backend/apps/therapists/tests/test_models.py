"""Tests cho TherapistProfile model."""
import pytest
from django.contrib.auth import get_user_model
from apps.therapists.models import TherapistProfile

User = get_user_model()


@pytest.mark.django_db
class TestTherapistProfileModel:
    def test_create_therapist_profile(self):
        """Test tạo TherapistProfile liên kết với User."""
        user = User.objects.create_user(
            email="therapist@test.com",
            full_name="Therapist One",
            password="pass123",
            role="therapist",
        )
        profile = TherapistProfile.objects.create(
            user=user,
            status="approved",
            years_of_experience=5,
            specialties=["Massage", "Acupressure"],
        )

        assert profile.user == user
        assert profile.status == "approved"
        assert profile.years_of_experience == 5
        assert profile.specialties == ["Massage", "Acupressure"]
        assert profile.rating == 0.0
        assert profile.completed_bookings == 0

    def test_therapist_profile_default_status(self):
        """Test profile mới mặc định là pending_approval."""
        user = User.objects.create_user(
            email="new_therapist@test.com",
            full_name="New Therapist",
            password="pass123",
            role="therapist",
        )
        profile = TherapistProfile.objects.create(user=user)

        assert profile.status == "pending_approval"

    def test_therapist_profile_str(self):
        """Test __str__ trả về email user."""
        user = User.objects.create_user(
            email="strtest@test.com",
            full_name="Str Test",
            password="pass123",
        )
        profile = TherapistProfile.objects.create(user=user)
        assert str(profile) == "strtest@test.com"

    def test_therapist_profile_cascade_delete(self):
        """Test xóa user sẽ xóa TherapistProfile."""
        user = User.objects.create_user(
            email="cascade@test.com",
            full_name="Cascade Test",
            password="pass123",
        )
        profile = TherapistProfile.objects.create(user=user)
        profile_id = profile.pk

        user.delete()

        assert not TherapistProfile.objects.filter(pk=profile_id).exists()

    def test_therapist_profile_one_to_one(self):
        """Test mỗi User chỉ có một TherapistProfile."""
        user = User.objects.create_user(
            email="onetoone@test.com",
            full_name="One To One",
            password="pass123",
        )
        TherapistProfile.objects.create(user=user)

        with pytest.raises(Exception):  # IntegrityError
            TherapistProfile.objects.create(user=user)
