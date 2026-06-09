"""Tests cho Treatment model."""
import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from apps.treatments.models import Treatment

User = get_user_model()


@pytest.mark.django_db
class TestTreatmentModel:
    def test_create_treatment(self):
        """Test tạo treatment với dữ liệu hợp lệ."""
        therapist = User.objects.create_user(
            email="therapist@test.com",
            full_name="Therapist",
            password="pass",
            role="therapist",
        )
        treatment = Treatment.objects.create(
            therapist=therapist,
            name="Massage Cổ Vai Gáy",
            category="neck_shoulder",
            description="Massage chuyên sâu vùng cổ vai gáy",
            price=Decimal("350000"),
            duration_minutes=60,
            image_url="https://example.com/treatment.jpg",
        )

        assert treatment.name == "Massage Cổ Vai Gáy"
        assert treatment.category == "neck_shoulder"
        assert treatment.price == Decimal("350000")
        assert treatment.duration_minutes == 60
        assert treatment.is_available is True
        assert treatment.rating == 0.0
        assert treatment.review_count == 0

    def test_treatment_category_choices(self):
        """Test category phải là một trong các choice hợp lệ."""
        therapist = User.objects.create_user(
            email="t2@test.com", full_name="T2", password="pass", role="therapist",
        )
        treatment = Treatment(
            therapist=therapist,
            name="Test",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("100000"),
            duration_minutes=30,
            image_url="https://example.com/img.jpg",
        )
        treatment.full_clean()  # Không lỗi

        treatment.category = "invalid_category"
        with pytest.raises(ValidationError):
            treatment.full_clean()

    def test_treatment_price_positive(self):
        """Test price phải lớn hơn 0."""
        therapist = User.objects.create_user(
            email="t3@test.com", full_name="T3", password="pass", role="therapist",
        )
        treatment = Treatment(
            therapist=therapist,
            name="Test",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("0"),
            duration_minutes=30,
            image_url="https://example.com/img.jpg",
        )
        with pytest.raises(ValidationError):
            treatment.full_clean()

    def test_treatment_str(self):
        """Test __str__ trả về tên treatment."""
        therapist = User.objects.create_user(
            email="t4@test.com", full_name="T4", password="pass", role="therapist",
        )
        treatment = Treatment(
            therapist=therapist,
            name="Acupressure Treatment",
            category="acupressure",
            description="Desc",
            price=Decimal("200000"),
            duration_minutes=45,
            image_url="https://example.com/img.jpg",
        )
        assert str(treatment) == "Acupressure Treatment"

    def test_treatment_soft_delete(self):
        """Test soft delete đặt is_available=False."""
        therapist = User.objects.create_user(
            email="t5@test.com", full_name="T5", password="pass", role="therapist",
        )
        treatment = Treatment.objects.create(
            therapist=therapist,
            name="To Delete",
            category="recovery",
            description="Desc",
            price=Decimal("100000"),
            duration_minutes=30,
            image_url="https://example.com/img.jpg",
        )

        treatment.soft_delete()
        assert treatment.is_available is False

        # Vẫn tồn tại trong DB
        assert Treatment.objects.filter(pk=treatment.pk).exists()
