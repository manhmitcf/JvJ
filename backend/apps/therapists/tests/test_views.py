"""Tests cho therapist public và apply endpoints."""
import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from apps.therapists.models import TherapistProfile

User = get_user_model()


@pytest.mark.django_db
class TestTherapistList:
    def test_list_approved_therapists(self, client):
        """Test danh sách chỉ trả về therapist đã duyệt."""
        user1 = User.objects.create_user(
            email="t1@test.com", full_name="T One", password="pass", role="therapist"
        )
        user2 = User.objects.create_user(
            email="t2@test.com", full_name="T Two", password="pass", role="therapist"
        )
        TherapistProfile.objects.create(user=user1, status="approved", rating=4.5)
        TherapistProfile.objects.create(user=user2, status="pending_approval")

        response = client.get("/api/v1/therapists/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 1
        assert data["results"][0]["full_name"] == "T One"

    def test_list_therapists_unauthenticated(self, client):
        """Test danh sách hoạt động không cần auth."""
        response = client.get("/api/v1/therapists/")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestTherapistDetail:
    def test_detail_approved_therapist(self, client):
        """Test detail trả về thông tin therapist đã duyệt."""
        user = User.objects.create_user(
            email="detail@test.com", full_name="Detail Therapist", password="pass", role="therapist"
        )
        profile = TherapistProfile.objects.create(user=user, status="approved", rating=4.0)

        response = client.get(f"/api/v1/therapists/{profile.id}/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["full_name"] == "Detail Therapist"
        assert data["rating"] == "4.0"

    def test_detail_pending_therapist_returns_404(self, client):
        """Test detail trả 404 cho therapist chưa duyệt."""
        user = User.objects.create_user(
            email="pending@test.com", full_name="Pending", password="pass", role="therapist"
        )
        profile = TherapistProfile.objects.create(user=user, status="pending_approval")

        response = client.get(f"/api/v1/therapists/{profile.id}/")

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestTherapistApply:
    def test_customer_can_apply(self, auth_client, user):
        """Test customer có thể gửi đơn đăng ký therapist."""
        response = auth_client.post("/api/v1/therapists/apply/", {
            "years_of_experience": 3,
            "specialties": ["Massage", "Acupressure"],
        }, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert TherapistProfile.objects.filter(user=user).exists()

        profile = TherapistProfile.objects.get(user=user)
        assert profile.status == "pending_approval"
        assert profile.years_of_experience == 3

        user.refresh_from_db()
        assert user.role == "therapist"

    def test_therapist_cannot_apply_again_if_approved(self, therapist_client, therapist_user):
        """Test therapist đã duyệt không thể đăng ký lại."""
        # Fixture `therapist_user` đã tạo sẵn TherapistProfile với status="approved"
        response = therapist_client.post("/api/v1/therapists/apply/", {
            "years_of_experience": 5,
            "specialties": ["Massage"],
        }, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_rejected_therapist_can_reapply(self, auth_client, user):
        """Test therapist bị reject có thể gửi lại hồ sơ."""
        profile = TherapistProfile.objects.create(
            user=user, status="rejected", rejection_reason="Thiếu chứng chỉ"
        )
        user.role = "therapist"
        user.save()

        response = auth_client.post("/api/v1/therapists/apply/", {
            "years_of_experience": 5,
            "specialties": ["Deep Tissue"],
            "certificate_urls": ["https://example.com/cert.pdf"],
        }, format="json")

        assert response.status_code == status.HTTP_200_OK
        profile.refresh_from_db()
        assert profile.status == "pending_approval"
        assert profile.years_of_experience == 5


@pytest.mark.django_db
class TestTherapistApplyStatus:
    def test_status_no_profile(self, auth_client):
        """Test status trả về no_profile khi chưa có đơn."""
        response = auth_client.get("/api/v1/therapists/apply/status/")
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["has_profile"] is False

    def test_status_with_profile(self, auth_client, user):
        """Test status trả về thông tin profile khi có đơn."""
        TherapistProfile.objects.create(user=user, status="pending_approval")

        response = auth_client.get("/api/v1/therapists/apply/status/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["has_profile"] is True
        assert data["status"] == "pending_approval"


@pytest.mark.django_db
class TestTherapistDashboard:
    def test_dashboard_unauthenticated(self, client):
        """Chưa đăng nhập → 401."""
        response = client.get("/api/v1/therapists/dashboard/")
        assert response.status_code == 401

    def test_dashboard_customer_forbidden(self, auth_client):
        """Customer → 403."""
        response = auth_client.get("/api/v1/therapists/dashboard/")
        assert response.status_code == 403

    def test_dashboard_therapist(self, therapist_client):
        """Therapist thấy metrics cơ bản."""
        response = therapist_client.get("/api/v1/therapists/dashboard/")
        assert response.status_code == 200
        data = response.json()["data"]
        assert "pending_count" in data
        assert "completed_count" in data
        assert "today_appointments" in data
        assert "monthly_revenue" in data
        assert "rating" in data
        assert isinstance(data["pending_count"], int)
        assert isinstance(data["today_appointments"], list)

    def test_dashboard_today_appointments(self, therapist_client, therapist_user, user, treatment):
        """Chỉ trả về appointment của hôm nay."""
        from django.utils import timezone
        from datetime import time as dtime

        from apps.bookings.models import Booking
        from apps.timeslots.models import TimeSlot

        today = timezone.localdate()
        today_slot = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=today,
            start_time=dtime(10, 0),
            end_time=dtime(11, 0),
        )
        Booking.objects.create(
            customer=user,
            therapist=therapist_user,
            treatment=treatment,
            timeslot=today_slot,
            address="123 Test St",
            contact_phone="0901234567",
            total_amount=treatment.price,
            code="JVJ-DASH-001",
            status="confirmed",
        )

        response = therapist_client.get("/api/v1/therapists/dashboard/")
        data = response.json()["data"]
        assert len(data["today_appointments"]) == 1
        assert data["today_appointments"][0]["customer_name"] == "Test Customer"

    def test_dashboard_monthly_revenue_only_completed(self, therapist_client, therapist_user, user, treatment):
        """Doanh thu tháng chỉ tính booking completed."""
        from datetime import date, time as dtime
        from decimal import Decimal

        from apps.bookings.models import Booking
        from apps.timeslots.models import TimeSlot
        from django.utils import timezone

        slot = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date.today(),
            start_time=dtime(8, 0),
            end_time=dtime(9, 0),
        )
        completed = Booking.objects.create(
            customer=user,
            therapist=therapist_user,
            treatment=treatment,
            timeslot=slot,
            address="123 Test",
            contact_phone="0901234567",
            total_amount=Decimal("500000"),
            code="JVJ-DASH-002",
            status="completed",
        )
        completed.completed_at = timezone.now()
        completed.save(update_fields=["completed_at"])
        slot2 = TimeSlot.objects.create(
            therapist=therapist_user,
            treatment=treatment,
            date=date.today(),
            start_time=dtime(12, 0),
            end_time=dtime(13, 0),
        )
        Booking.objects.create(
            customer=user,
            therapist=therapist_user,
            treatment=treatment,
            timeslot=slot2,
            address="123 Test",
            contact_phone="0901234567",
            total_amount=Decimal("300000"),
            code="JVJ-DASH-003",
            status="confirmed",
        )

        response = therapist_client.get("/api/v1/therapists/dashboard/")
        data = response.json()["data"]
        assert data["monthly_revenue"] == 500000
        assert data["completed_count"] == 1


@pytest.mark.django_db
class TestTherapistProfile:
    def test_get_profile(self, therapist_client):
        response = therapist_client.get("/api/v1/therapists/profile/")
        assert response.status_code == 200
        data = response.json()["data"]
        assert data["email"] == "therapist@test.com"
        assert data["full_name"] == "Test Therapist"

    def test_update_profile(self, therapist_client, therapist_user):
        response = therapist_client.put("/api/v1/therapists/profile/", {
            "full_name": "New Name",
            "phone": "0909999999",
            "bio": "Therapist chuyên nghiệp",
            "years_of_experience": 5,
        }, format="json")
        assert response.status_code == 200
        therapist_user.refresh_from_db()
        assert therapist_user.full_name == "New Name"
        assert therapist_user.phone == "0909999999"

    def test_toggle_online(self, therapist_client):
        response = therapist_client.patch("/api/v1/therapists/profile/status/", {
            "is_online": True
        }, format="json")
        assert response.status_code == 200
        assert response.json()["data"]["is_online"] is True

        response = therapist_client.patch("/api/v1/therapists/profile/status/", {
            "is_online": False
        }, format="json")
        assert response.status_code == 200
        assert response.json()["data"]["is_online"] is False

    def test_customer_cannot_access_profile(self, auth_client):
        response = auth_client.get("/api/v1/therapists/profile/")
        assert response.status_code == 403
