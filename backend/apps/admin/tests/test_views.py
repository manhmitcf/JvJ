import datetime

import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.bookings.models import Booking
from apps.therapists.models import TherapistProfile

User = get_user_model()


def get_auth_client(user):
    """Trả về APIClient đã authenticate với JWT token."""
    api_client = APIClient()
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return api_client


@pytest.mark.django_db
class TestAdminStats:
    @pytest.fixture
    def admin_user(self, db):
        return User.objects.create_user(
            email="admin@jvj.vn", password="test", full_name="Admin", role="admin"
        )

    @pytest.fixture
    def customer_user(self, db):
        return User.objects.create_user(
            email="cust@jvj.vn", password="test", full_name="Customer", role="customer"
        )

    def test_admin_can_access_stats(self, admin_user):
        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/stats/overview/")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert "total_customers" in data
        assert "active_therapists" in data
        assert "new_bookings_today" in data
        assert "pending_therapist_approvals" in data

    def test_non_admin_gets_403(self, customer_user):
        api_client = get_auth_client(customer_user)
        resp = api_client.get("/api/v1/admin/stats/overview/")
        assert resp.status_code == 403

    def test_stats_count_is_accurate(self, admin_user):
        for i in range(3):
            User.objects.create_user(
                email=f"c{i}@jvj.vn", password="test", full_name=f"C{i}", role="customer"
            )
        t = User.objects.create_user(
            email="t@jvj.vn", password="test", full_name="Therapist", role="therapist"
        )
        TherapistProfile.objects.create(user=t, status="approved")
        p = User.objects.create_user(
            email="p@jvj.vn", password="test", full_name="Pending", role="therapist"
        )
        TherapistProfile.objects.create(user=p, status="pending_approval")

        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/stats/overview/")
        data = resp.json()["data"]
        assert data["total_customers"] == 3
        assert data["active_therapists"] == 1
        assert data["pending_therapist_approvals"] == 1

    def test_unauthenticated_gets_401(self):
        client = APIClient()
        resp = client.get("/api/v1/admin/stats/overview/")
        assert resp.status_code == 401


@pytest.mark.django_db
class TestAdminUsers:
    @pytest.fixture
    def admin_user(self, db):
        return User.objects.create_user(email="admin2@jvj.vn", password="test", full_name="Admin", role="admin")

    @pytest.fixture
    def customers(self, db):
        users = []
        for i in range(3):
            u = User.objects.create_user(email=f"user{i}@jvj.vn", password="test", full_name=f"User {i}", role="customer")
            users.append(u)
        return users

    def test_list_users(self, admin_user, customers):
        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/users/")
        assert resp.status_code == 200
        assert "data" in resp.json()

    def test_filter_by_role(self, admin_user, customers):
        User.objects.create_user(email="ther@jvj.vn", password="test", full_name="Therapist", role="therapist")
        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/users/?role=therapist")
        data = resp.json()["data"]["results"]
        assert len(data) == 1
        assert data[0]["email"] == "ther@jvj.vn"

    def test_search_users(self, admin_user, customers):
        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/users/?search=User+0")
        data = resp.json()["data"]["results"]
        assert len(data) == 1

    def test_suspend_user(self, admin_user, customers):
        api_client = get_auth_client(admin_user)
        resp = api_client.patch(f"/api/v1/admin/users/{customers[0].id}/update/", {"is_active": False}, format="json")
        assert resp.status_code == 200
        customers[0].refresh_from_db()
        assert customers[0].is_active is False


@pytest.mark.django_db
class TestAdminTherapistApproval:
    @pytest.fixture
    def admin_user(self):
        return User.objects.create_user(email="admin3@jvj.vn", password="test", full_name="Admin", role="admin")

    @pytest.fixture
    def pending_therapist(self):
        u = User.objects.create_user(email="pending@jvj.vn", password="test", full_name="Pending T", role="therapist")
        return TherapistProfile.objects.create(user=u, status="pending_approval", years_of_experience=5, specialties=["Massage"])

    def test_list_pending(self, admin_user, pending_therapist):
        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/therapists/pending/")
        assert resp.status_code == 200
        results = resp.json()["data"]["results"]
        assert len(results) == 1
        assert results[0]["user_email"] == "pending@jvj.vn"

    def test_approve_therapist(self, admin_user, pending_therapist):
        api_client = get_auth_client(admin_user)
        resp = api_client.post(f"/api/v1/admin/therapists/{pending_therapist.id}/approve/")
        assert resp.status_code == 200
        pending_therapist.refresh_from_db()
        assert pending_therapist.status == "approved"
        assert pending_therapist.user.role == "therapist"
        assert pending_therapist.reviewed_by_id == admin_user.id

    def test_reject_therapist_requires_reason(self, admin_user, pending_therapist):
        api_client = get_auth_client(admin_user)
        resp = api_client.post(f"/api/v1/admin/therapists/{pending_therapist.id}/reject/", {}, format="json")
        assert resp.status_code == 400

        resp = api_client.post(f"/api/v1/admin/therapists/{pending_therapist.id}/reject/", {"reason": "Chứng chỉ không hợp lệ"}, format="json")
        assert resp.status_code == 200
        pending_therapist.refresh_from_db()
        assert pending_therapist.status == "rejected"
        assert pending_therapist.rejection_reason == "Chứng chỉ không hợp lệ"

    def test_detail_therapist(self, admin_user, pending_therapist):
        api_client = get_auth_client(admin_user)
        resp = api_client.get(f"/api/v1/admin/therapists/{pending_therapist.id}/")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["user_full_name"] == "Pending T"


@pytest.mark.django_db
class TestAdminBookings:
    @pytest.fixture
    def admin_user(self):
        return User.objects.create_user(email="admin4@jvj.vn", password="test", full_name="Admin", role="admin")

    @pytest.fixture
    def booking(self, admin_user):
        from apps.treatments.models import Treatment
        from apps.timeslots.models import TimeSlot
        import datetime
        customer = User.objects.create_user(email="cust4@jvj.vn", password="test", full_name="Customer", role="customer")
        therapist = User.objects.create_user(email="ther4@jvj.vn", password="test", full_name="Therapist", role="therapist")
        treatment = Treatment.objects.create(
            therapist=therapist, name="Test", description="Desc",
            price=100000, duration_minutes=60, image_url="http://example.com/img.jpg",
        )
        ts = TimeSlot.objects.create(
            therapist=therapist, treatment=treatment,
            date=datetime.date.today(), start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
        )
        return Booking.objects.create_booking(
            customer, therapist, treatment, ts, "123 Test St", "0901234567", 100000,
        )

    def test_list_all_bookings(self, admin_user, booking):
        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/bookings/")
        assert resp.status_code == 200
        results = resp.json()["data"]["results"]
        assert len(results) >= 1

    def test_force_cancel_booking(self, admin_user, booking):
        api_client = get_auth_client(admin_user)
        resp = api_client.post(
            f"/api/v1/admin/bookings/{booking.id}/force-cancel/",
            {"reason": "Khách yêu cầu"},
            format="json",
        )
        assert resp.status_code == 200
        booking.refresh_from_db()
        assert booking.status == "cancelled"

    def test_force_cancel_requires_reason(self, admin_user, booking):
        api_client = get_auth_client(admin_user)
        resp = api_client.post(
            f"/api/v1/admin/bookings/{booking.id}/force-cancel/",
            {},
            format="json",
        )
        assert resp.status_code == 400

    def test_cannot_force_cancel_completed(self, admin_user, booking):
        from django.utils import timezone
        booking.status = "completed"
        booking.completed_at = timezone.now()
        booking.save()
        api_client = get_auth_client(admin_user)
        resp = api_client.post(
            f"/api/v1/admin/bookings/{booking.id}/force-cancel/",
            {"reason": "test"},
            format="json",
        )
        assert resp.status_code == 400


# ─── Admin Spa CRUD ───


@pytest.mark.django_db
class TestAdminSpas:
    @pytest.fixture
    def admin_user(self):
        return User.objects.create_user(email="admin5@jvj.vn", password="test", full_name="Admin", role="admin")

    def test_list_spas(self, admin_user):
        from apps.spas.models import Spa
        Spa.objects.create(
            name="Spa A", address="123 Test", district="Hải Châu",
            latitude=16.05, longitude=108.22, phone="0901234567",
            email="spa@jvj.vn", open_time=datetime.time(8, 0),
            close_time=datetime.time(20, 0), description="Test spa",
        )
        api_client = get_auth_client(admin_user)
        resp = api_client.get("/api/v1/admin/spas/")
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data

    def test_create_spa(self, admin_user):
        api_client = get_auth_client(admin_user)
        data = {
            "name": "New Spa", "address": "456 Test", "district": "Thanh Khê",
            "latitude": 16.06, "longitude": 108.21, "phone": "0901234568",
            "email": "newspa@jvj.vn", "open_time": "08:00", "close_time": "20:00",
            "description": "New test spa",
        }
        resp = api_client.post("/api/v1/admin/spas/", data, format="json")
        assert resp.status_code == 201
        assert resp.json()["data"]["name"] == "New Spa"

    def test_update_spa(self, admin_user):
        from apps.spas.models import Spa
        spa = Spa.objects.create(
            name="Old Name", address="789 Test", district="Hải Châu",
            latitude=16.05, longitude=108.22, phone="0901234569",
            email="old@jvj.vn", open_time=datetime.time(8, 0),
            close_time=datetime.time(20, 0), description="Test",
        )
        api_client = get_auth_client(admin_user)
        resp = api_client.put(
            f"/api/v1/admin/spas/{spa.id}/",
            {"name": "Updated Name", "address": "789 Test", "district": "Hải Châu",
             "latitude": 16.05, "longitude": 108.22, "phone": "0901234569",
             "email": "updated@jvj.vn", "open_time": "08:00", "close_time": "20:00",
             "description": "Updated", "status": "active"},
            format="json",
        )
        assert resp.status_code == 200
        spa.refresh_from_db()
        assert spa.name == "Updated Name"

    def test_hide_spa_on_delete(self, admin_user):
        from apps.spas.models import Spa
        spa = Spa.objects.create(
            name="Hide Me", address="789 Test", district="Hải Châu",
            latitude=16.05, longitude=108.22, phone="0901234569",
            email="hide@jvj.vn", open_time=datetime.time(8, 0),
            close_time=datetime.time(20, 0), description="Test",
        )
        api_client = get_auth_client(admin_user)
        resp = api_client.delete(f"/api/v1/admin/spas/{spa.id}/")
        assert resp.status_code == 204
        spa.refresh_from_db()
        assert spa.status == "hidden"

    def test_non_admin_cannot_access_spas(self):
        customer = User.objects.create_user(email="cust5@jvj.vn", password="test", full_name="Customer", role="customer")
        api_client = get_auth_client(customer)
        resp = api_client.get("/api/v1/admin/spas/")
        assert resp.status_code == 403


# ─── Admin Review Moderation ───


@pytest.mark.django_db
class TestAdminReviews:
    @pytest.fixture
    def admin_user(self):
        return User.objects.create_user(email="admin6@jvj.vn", password="test", full_name="Admin", role="admin")

    @pytest.fixture
    def review(self):
        from apps.reviews.models import Review
        from apps.treatments.models import Treatment
        from apps.timeslots.models import TimeSlot
        from django.utils import timezone

        customer = User.objects.create_user(email="cust6@jvj.vn", password="test", full_name="Customer", role="customer")
        therapist = User.objects.create_user(email="ther6@jvj.vn", password="test", full_name="Therapist", role="therapist")
        TherapistProfile.objects.create(user=therapist, status="approved")
        treatment = Treatment.objects.create(
            therapist=therapist, name="Test", category="neck_shoulder",
            description="Desc", price=100000, duration_minutes=60,
            image_url="http://example.com/img.jpg",
        )
        ts = TimeSlot.objects.create(
            therapist=therapist, treatment=treatment,
            date=datetime.date.today(), start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
        )
        booking = Booking.objects.create_booking(
            customer, therapist, treatment, ts, "123 Test", "0901234567", 100000,
        )
        booking.status = "completed"
        booking.completed_at = timezone.now()
        booking.save(update_fields=["status", "completed_at"])
        return Review.objects.create_review(
            booking=booking, customer=customer, therapist=therapist,
            treatment=treatment, rating=5, comment="Tuyệt vời", tags=["Tận tâm"],
        )

    def test_hide_review(self, admin_user, review):
        api_client = get_auth_client(admin_user)
        resp = api_client.patch(
            f"/api/v1/admin/reviews/{review.id}/visibility/",
            {"is_visible": False},
            format="json",
        )
        assert resp.status_code == 200
        review.refresh_from_db()
        assert review.is_visible is False
        assert review.moderated_by_id == admin_user.id

    def test_show_review(self, admin_user):
        from apps.reviews.models import Review
        from apps.treatments.models import Treatment
        from apps.timeslots.models import TimeSlot
        from django.utils import timezone

        customer = User.objects.create_user(email="cust6b@jvj.vn", password="test", full_name="Customer B", role="customer")
        therapist = User.objects.create_user(email="ther6b@jvj.vn", password="test", full_name="Therapist B", role="therapist")
        TherapistProfile.objects.create(user=therapist, status="approved")
        treatment = Treatment.objects.create(
            therapist=therapist, name="Test B", category="neck_shoulder",
            description="Desc", price=100000, duration_minutes=60,
            image_url="http://example.com/img.jpg",
        )
        ts = TimeSlot.objects.create(
            therapist=therapist, treatment=treatment,
            date=datetime.date.today(), start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
        )
        booking = Booking.objects.create_booking(
            customer, therapist, treatment, ts, "123 Test", "0901234567", 100000,
        )
        booking.status = "completed"
        booking.completed_at = timezone.now()
        booking.save(update_fields=["status", "completed_at"])
        review = Review.objects.create_review(
            booking=booking, customer=customer, therapist=therapist,
            treatment=treatment, rating=4, comment="OK", tags=["Chuyên nghiệp"],
        )
        review.is_visible = False
        review.save(update_fields=["is_visible"])

        api_client = get_auth_client(admin_user)
        resp = api_client.patch(
            f"/api/v1/admin/reviews/{review.id}/visibility/",
            {"is_visible": True},
            format="json",
        )
        assert resp.status_code == 200
        review.refresh_from_db()
        assert review.is_visible is True

    def test_visibility_requires_field(self, admin_user, review):
        api_client = get_auth_client(admin_user)
        resp = api_client.patch(
            f"/api/v1/admin/reviews/{review.id}/visibility/",
            {},
            format="json",
        )
        assert resp.status_code == 400

    def test_non_admin_cannot_moderate(self, review):
        customer = User.objects.create_user(email="cust6c@jvj.vn", password="test", full_name="Customer C", role="customer")
        api_client = get_auth_client(customer)
        resp = api_client.patch(
            f"/api/v1/admin/reviews/{review.id}/visibility/",
            {"is_visible": False},
            format="json",
        )
        assert resp.status_code == 403