"""Tests cho treatment public và CRUD endpoints."""
import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import status

from apps.treatments.models import Treatment

User = get_user_model()


@pytest.mark.django_db
class TestTreatmentList:
    def test_list_treatments_public(self, client, therapist_user):
        """Test listing treatments chỉ trả về treatment is_available=True."""
        Treatment.objects.create(
            therapist=therapist_user,
            name="Massage Cổ Vai Gáy",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("350000"),
            duration_minutes=60,
            image_url="https://example.com/img.jpg",
        )
        Treatment.objects.create(
            therapist=therapist_user,
            name="Hidden Treatment",
            category="recovery",
            description="Desc",
            price=Decimal("200000"),
            duration_minutes=30,
            image_url="https://example.com/img.jpg",
            is_available=False,
        )

        response = client.get("/api/v1/treatments/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 1
        assert data["results"][0]["name"] == "Massage Cổ Vai Gáy"

    def test_list_filter_by_category(self, client, therapist_user):
        """Test filter treatments theo category."""
        Treatment.objects.create(
            therapist=therapist_user,
            name="Neck Massage",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("300000"),
            duration_minutes=45,
            image_url="https://example.com/img.jpg",
        )
        Treatment.objects.create(
            therapist=therapist_user,
            name="Recovery Session",
            category="recovery",
            description="Desc",
            price=Decimal("400000"),
            duration_minutes=60,
            image_url="https://example.com/img.jpg",
        )

        response = client.get("/api/v1/treatments/?category=neck_shoulder")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 1
        assert data["results"][0]["category"] == "neck_shoulder"


@pytest.mark.django_db
class TestTreatmentCreate:
    def test_therapist_can_create_treatment(self, therapist_client, therapist_user):
        """Test therapist có thể tạo treatment."""
        response = therapist_client.post("/api/v1/treatments/", {
            "name": "Deep Tissue Massage",
            "category": "neck_shoulder",
            "description": "Massage chuyên sâu",
            "price": 450000,
            "duration_minutes": 90,
            "image_url": "https://example.com/deep.jpg",
        }, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()["data"]
        assert data["name"] == "Deep Tissue Massage"
        assert data["therapist_id"] == str(therapist_user.id)

        assert Treatment.objects.filter(name="Deep Tissue Massage").exists()

    def test_customer_cannot_create_treatment(self, auth_client):
        """Test customer không thể tạo treatments."""
        response = auth_client.post("/api/v1/treatments/", {
            "name": "Fake Treatment",
            "category": "neck_shoulder",
            "description": "Desc",
            "price": 100000,
            "duration_minutes": 30,
            "image_url": "https://example.com/img.jpg",
        }, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_guest_cannot_create_treatment(self, client):
        """Test guest không thể tạo treatments."""
        response = client.post("/api/v1/treatments/", {
            "name": "Fake Treatment",
            "category": "neck_shoulder",
            "description": "Desc",
            "price": 100000,
            "duration_minutes": 30,
            "image_url": "https://example.com/img.jpg",
        }, format="json")

        assert response.status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN)


@pytest.mark.django_db
class TestTreatmentUpdateDelete:
    def test_therapist_can_update_own_treatment(self, therapist_client, therapist_user):
        """Test therapist có thể update treatment của mình."""
        treatment = Treatment.objects.create(
            therapist=therapist_user,
            name="Original",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("300000"),
            duration_minutes=45,
            image_url="https://example.com/img.jpg",
        )

        response = therapist_client.put(f"/api/v1/treatments/{treatment.id}/", {
            "name": "Updated Name",
            "category": "neck_shoulder",
            "description": "Updated desc",
            "price": 350000,
            "duration_minutes": 60,
            "image_url": "https://example.com/new.jpg",
        }, format="json")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["name"] == "Updated Name"
        assert data["price"] == "350000"

    def test_therapist_cannot_update_others_treatment(self, therapist_client):
        """Test therapist không thể update treatment của người khác."""
        other = User.objects.create_user(
            email="other@test.com", full_name="Other", password="pass", role="therapist",
        )
        treatment = Treatment.objects.create(
            therapist=other,
            name="Other's Treatment",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("300000"),
            duration_minutes=45,
            image_url="https://example.com/img.jpg",
        )

        response = therapist_client.put(f"/api/v1/treatments/{treatment.id}/", {
            "name": "Hacked",
            "category": "neck_shoulder",
            "description": "Desc",
            "price": 300000,
            "duration_minutes": 45,
            "image_url": "https://example.com/img.jpg",
        }, format="json")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_soft_deleted_treatment_returns_404(self, client, therapist_user):
        """Test public detail không trả về treatment đã soft-delete."""
        treatment = Treatment.objects.create(
            therapist=therapist_user,
            name="Hidden Detail",
            category="recovery",
            description="Desc",
            price=Decimal("200000"),
            duration_minutes=30,
            image_url="https://example.com/img.jpg",
            is_available=False,
        )

        response = client.get(f"/api/v1/treatments/{treatment.id}/")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_soft_delete_treatment(self, therapist_client, therapist_user):
        """Test delete thực hiện soft delete."""
        treatment = Treatment.objects.create(
            therapist=therapist_user,
            name="To Delete",
            category="recovery",
            description="Desc",
            price=Decimal("200000"),
            duration_minutes=30,
            image_url="https://example.com/img.jpg",
        )

        response = therapist_client.delete(f"/api/v1/treatments/{treatment.id}/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["message"] == "Dịch vụ đã được ẩn"
        treatment.refresh_from_db()
        assert treatment.is_available is False

    def test_therapist_cannot_delete_others_treatment(self, therapist_client):
        """Test therapist không thể DELETE treatment của người khác (expect 403)."""
        other = User.objects.create_user(
            email="other-del@test.com", full_name="Other Therapist", password="pass", role="therapist",
        )
        treatment = Treatment.objects.create(
            therapist=other,
            name="Other's Treatment To Delete",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("300000"),
            duration_minutes=45,
            image_url="https://example.com/img.jpg",
        )

        response = therapist_client.delete(f"/api/v1/treatments/{treatment.id}/")

        assert response.status_code == status.HTTP_403_FORBIDDEN
        treatment.refresh_from_db()
        assert treatment.is_available is True

    def test_admin_can_update_others_treatment(self, admin_client):
        """Test admin có thể update treatment của người khác."""
        other = User.objects.create_user(
            email="other-admin-update@test.com", full_name="Other Therapist", password="pass", role="therapist",
        )
        treatment = Treatment.objects.create(
            therapist=other,
            name="Original by Other",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("300000"),
            duration_minutes=45,
            image_url="https://example.com/img.jpg",
        )

        response = admin_client.put(f"/api/v1/treatments/{treatment.id}/", {
            "name": "Admin Updated",
            "category": "neck_shoulder",
            "description": "Updated by admin",
            "price": 500000,
            "duration_minutes": 60,
            "image_url": "https://example.com/admin.jpg",
        }, format="json")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["name"] == "Admin Updated"
        treatment.refresh_from_db()
        assert treatment.name == "Admin Updated"

    def test_admin_can_soft_delete_others_treatment(self, admin_client):
        """Test admin có thể soft-delete treatment của người khác."""
        other = User.objects.create_user(
            email="other-admin-delete@test.com", full_name="Other Therapist", password="pass", role="therapist",
        )
        treatment = Treatment.objects.create(
            therapist=other,
            name="ToDelete by Other",
            category="recovery",
            description="Desc",
            price=Decimal("200000"),
            duration_minutes=30,
            image_url="https://example.com/img.jpg",
        )

        response = admin_client.delete(f"/api/v1/treatments/{treatment.id}/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["message"] == "Dịch vụ đã được ẩn"
        treatment.refresh_from_db()
        assert treatment.is_available is False

    def test_create_with_price_zero_returns_400(self, therapist_client):
        """Test API create với price=0 trả 400."""
        response = therapist_client.post("/api/v1/treatments/", {
            "name": "Zero Price Treatment",
            "category": "neck_shoulder",
            "description": "Desc",
            "price": 0,
            "duration_minutes": 30,
            "image_url": "https://example.com/img.jpg",
        }, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not Treatment.objects.filter(name="Zero Price Treatment").exists()

    def test_create_with_price_less_than_one_returns_400(self, therapist_client):
        """Test API create với price=0.5 (< 1) trả 400."""
        response = therapist_client.post("/api/v1/treatments/", {
            "name": "Sub-one Price Treatment",
            "category": "neck_shoulder",
            "description": "Desc",
            "price": "0.5",
            "duration_minutes": 30,
            "image_url": "https://example.com/img.jpg",
        }, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert not Treatment.objects.filter(name="Sub-one Price Treatment").exists()
