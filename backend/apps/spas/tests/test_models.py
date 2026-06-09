"""Tests cho Spa model."""
import pytest
from django.core.exceptions import ValidationError

from apps.spas.models import Spa, location_xy


@pytest.mark.django_db
class TestSpaModel:
    def test_create_spa(self):
        """Test tạo Spa với dữ liệu hợp lệ."""
        spa = Spa.objects.create(
            name="JvJ Wellness Spa",
            address="123 Nguyễn Huệ, Quận Hải Châu",
            district="Hải Châu",
            latitude=16.067786,
            longitude=108.220833,
            phone="0901234567",
            email="spa@jvj.vn",
            open_time="08:00:00",
            close_time="21:00:00",
            description="Spa chăm sóc sức khỏe tại Đà Nẵng",
            status="active",
            image_urls=["https://example.com/spa1.jpg"],
        )

        assert spa.name == "JvJ Wellness Spa"
        assert spa.district == "Hải Châu"
        assert float(spa.latitude) == 16.067786
        assert float(spa.longitude) == 108.220833
        assert spa.status == "active"
        assert spa.linked_treatment_count == 0
        assert spa.location is not None

    def test_spa_location_auto_generated_and_updated(self):
        """Test location tự tạo và cập nhật theo lat/lng."""
        spa = Spa.objects.create(
            name="Test Spa",
            address="456 Trần Phú",
            district="Thanh Khê",
            latitude=16.075000,
            longitude=108.200000,
            phone="0901234567",
            email="test@jvj.vn",
            open_time="08:00:00",
            close_time="21:00:00",
            description="Desc",
        )
        x, y = location_xy(spa.location)
        assert x == 108.200000
        assert y == 16.075000

        spa.latitude = 16.080000
        spa.longitude = 108.210000
        spa.save()
        x, y = location_xy(spa.location)
        assert x == 108.210000
        assert y == 16.080000

    def test_spa_status_choices(self):
        """Test status phải thuộc active/hidden."""
        spa = Spa(
            name="Test",
            address="Addr",
            district="District",
            latitude=16.0,
            longitude=108.0,
            phone="0901234567",
            email="test@jvj.vn",
            open_time="08:00:00",
            close_time="21:00:00",
            description="Desc",
            status="active",
        )
        spa.full_clean()

        spa.status = "invalid"
        with pytest.raises(ValidationError):
            spa.full_clean()

    def test_spa_str(self):
        """Test __str__ trả về tên spa."""
        spa = Spa(
            name="My Spa",
            address="Addr",
            district="District",
            latitude=16.0,
            longitude=108.0,
            phone="0901234567",
            email="test@jvj.vn",
            open_time="08:00:00",
            close_time="21:00:00",
            description="Desc",
        )
        assert str(spa) == "My Spa"

    def test_spa_hide(self):
        """Test hide chuyển status thành hidden."""
        spa = Spa.objects.create(
            name="Hide Me",
            address="Addr",
            district="District",
            latitude=16.0,
            longitude=108.0,
            phone="0901234567",
            email="test@jvj.vn",
            open_time="08:00:00",
            close_time="21:00:00",
            description="Desc",
        )

        spa.hide()
        assert spa.status == "hidden"

    def test_distance_to_returns_km(self):
        """Test distance_to trả về khoảng cách km hợp lệ."""
        spa = Spa.objects.create(
            name="Distance Spa",
            address="Addr",
            district="Hải Châu",
            latitude=16.067786,
            longitude=108.220833,
            phone="0901234567",
            email="dist@jvj.vn",
            open_time="08:00:00",
            close_time="21:00:00",
            description="Desc",
        )

        distance = spa.distance_to(16.067, 108.220)
        assert distance >= 0
        assert distance < 1
