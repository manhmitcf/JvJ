"""Pytest fixtures for JvJ API tests."""
import pytest
from datetime import date, time
from decimal import Decimal
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def db(db):
    """Đảm bảo quyền truy cập database khả dụng."""
    pass


@pytest.fixture
def user(db):
    """Tạo người dùng customer."""
    return User.objects.create_user(
        email="customer@test.com",
        full_name="Test Customer",
        password="testpass123",
        role="customer",
    )


@pytest.fixture
def user_factory(db):
    """Factory để tạo user tùy ý."""
    def _make(**kwargs):
        return User.objects.create_user(**kwargs)
    return _make


@pytest.fixture
def therapist_user(db):
    """Tạo người dùng therapist."""
    user = User.objects.create_user(
        email="therapist@test.com",
        full_name="Test Therapist",
        password="testpass123",
        role="therapist",
    )
    from apps.therapists.models import TherapistProfile
    TherapistProfile.objects.create(user=user, status="approved")
    return user


@pytest.fixture
def admin_user(db):
    """Tạo người dùng admin."""
    return User.objects.create_user(
        email="admin@test.com",
        full_name="Test Admin",
        password="testpass123",
        role="admin",
    )


@pytest.fixture
def guest_client(client):
    """Trả về client chưa xác thực."""
    return client


@pytest.fixture
def auth_client(client, user):
    """Trả về client đã xác thực cho customer."""
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken

    api_client = APIClient()
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def therapist_client(client, therapist_user):
    """Trả về client đã xác thực cho therapist."""
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken

    api_client = APIClient()
    refresh = RefreshToken.for_user(therapist_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def admin_client(client, admin_user):
    """Trả về client đã xác thực cho admin."""
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken

    api_client = APIClient()
    refresh = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.fixture
def spa(db):
    """Tạo Spa mẫu cho test."""
    from apps.spas.models import Spa
    return Spa.objects.create(
        name="Spa Test Đà Nẵng",
        address="123 Đường Test",
        district="Hải Châu",
        latitude=Decimal("16.0544"),
        longitude=Decimal("108.2022"),
        phone="0905123456",
        email="spa@jvj.vn",
        open_time=time(8, 0),
        close_time=time(20, 0),
        description="Spa test cho booking flow",
    )


@pytest.fixture
def treatment(db, therapist_user, spa):
    """Tạo Treatment mẫu cho test."""
    from apps.treatments.models import Treatment
    return Treatment.objects.create(
        therapist=therapist_user,
        spa=spa,
        name="Massage cổ vai gáy",
        category="neck_shoulder",
        description="Massage trị liệu cổ vai gáy 60 phút",
        price=Decimal("300000"),
        duration_minutes=60,
    )


@pytest.fixture
def timeslot(db, therapist_user, treatment):
    """Tạo TimeSlot mẫu cho test."""
    from apps.timeslots.models import TimeSlot
    return TimeSlot.objects.create(
        therapist=therapist_user,
        treatment=treatment,
        date=date(2026, 6, 15),
        start_time=time(9, 0),
        end_time=time(10, 0),
    )


@pytest.fixture
def booking(db, user, therapist_user, treatment, timeslot):
    """Booking pending mặc định."""
    from apps.bookings.models import Booking
    return Booking.objects.create(
        customer=user,
        therapist=therapist_user,
        treatment=treatment,
        timeslot=timeslot,
        address="123 Nguyễn Huệ, Đà Nẵng",
        contact_phone="0901234567",
        total_amount=Decimal("350000"),
        code="JVJ-TEST",
        status="pending",
        payment_status="unpaid",
    )
