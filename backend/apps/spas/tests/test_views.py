"""Tests cho Spa public và map endpoints."""
import pytest
from decimal import Decimal
from rest_framework import status

from apps.spas.models import Spa


def create_spa(**overrides):
    data = {
        "name": "JvJ Wellness Spa",
        "address": "123 Nguyễn Huệ, Đà Nẵng",
        "district": "Hải Châu",
        "latitude": 16.067786,
        "longitude": 108.220833,
        "phone": "0901234567",
        "email": "spa@jvj.vn",
        "open_time": "08:00:00",
        "close_time": "21:00:00",
        "description": "Spa chăm sóc sức khỏe tại Đà Nẵng",
        "status": "active",
        "image_urls": ["https://example.com/spa.jpg"],
    }
    data.update(overrides)
    return Spa.objects.create(**data)


@pytest.mark.django_db
class TestSpaList:
    def test_list_active_spas(self, client):
        """Test danh sách chỉ trả về spa active."""
        create_spa(name="Active Spa", status="active")
        create_spa(name="Hidden Spa", email="hidden@jvj.vn", status="hidden")

        response = client.get("/api/v1/spas/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 1
        assert data["results"][0]["name"] == "Active Spa"

    def test_list_spas_unauthenticated(self, client):
        """Test listing spa không cần auth."""
        response = client.get("/api/v1/spas/")
        assert response.status_code == status.HTTP_200_OK

    def test_list_spas_filter_by_district(self, client):
        """Test lọc spa theo district."""
        create_spa(name="Spa HC", district="Hải Châu", email="hc@jvj.vn")
        create_spa(name="Spa TK", district="Thanh Khê", email="tk@jvj.vn")

        response = client.get("/api/v1/spas/?district=Hải Châu")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 1
        assert data["results"][0]["district"] == "Hải Châu"


@pytest.mark.django_db
class TestSpaDetail:
    def test_detail_active_spa(self, client):
        """Test detail spa active."""
        spa = create_spa(name="Detail Spa")

        response = client.get(f"/api/v1/spas/{spa.id}/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["name"] == "Detail Spa"

    def test_hidden_spa_detail_returns_404(self, client):
        """Test spa hidden không hiện ở detail."""
        spa = create_spa(name="Hidden Detail", status="hidden")

        response = client.get(f"/api/v1/spas/{spa.id}/")

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestSpaNearby:
    def test_nearby_spas(self, client):
        """Test nearby trả về spa trong bán kính và có distance_km."""
        create_spa(name="Nearby Spa", latitude=16.067786, longitude=108.220833)
        create_spa(name="Far Spa", email="far@jvj.vn", latitude=10.823099, longitude=106.629664)

        response = client.get("/api/v1/spas/nearby/?near=16.067,108.220&radius=5")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 1
        assert data["results"][0]["name"] == "Nearby Spa"
        assert data["results"][0]["distance_km"] is not None
        assert data["results"][0]["distance_km"] < 1

    def test_nearby_missing_param(self, client):
        """Test nearby thiếu near trả về danh sách rỗng."""
        create_spa(name="Any Spa")

        response = client.get("/api/v1/spas/nearby/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 0

    def test_nearby_excludes_hidden_spas(self, client):
        """Test nearby loại bỏ spa hidden."""
        create_spa(name="Hidden Nearby", status="hidden")

        response = client.get("/api/v1/spas/nearby/?near=16.067,108.220&radius=5")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 0

    def test_nearby_invalid_near_returns_empty(self, client):
        """Test nearby với near sai format trả danh sách rỗng."""
        create_spa(name="Any Spa")

        response = client.get("/api/v1/spas/nearby/?near=abc,def&radius=5")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 0

    def test_nearby_invalid_radius_returns_empty(self, client):
        """Test nearby với radius sai format trả danh sách rỗng thay vì 500."""
        create_spa(name="Any Spa")

        response = client.get("/api/v1/spas/nearby/?near=16.067,108.220&radius=abc")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 0


@pytest.mark.django_db
class TestSpaDistance:
    def test_distance_calculation(self, client):
        """Test distance endpoint trả về km giữa user và spa."""
        spa = create_spa(name="Distance Spa", latitude=16.067786, longitude=108.220833)

        response = client.get(f"/api/v1/spas/{spa.id}/distance/?from=16.067,108.220")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["spa_id"] == str(spa.id)
        assert data["spa_name"] == "Distance Spa"
        assert "distance_km" in data
        assert data["distance_km"] >= 0
        assert data["distance_km"] < 1

    def test_distance_missing_from_param(self, client):
        """Test distance trả 400 nếu thiếu from."""
        spa = create_spa(name="Missing Param Spa")

        response = client.get(f"/api/v1/spas/{spa.id}/distance/")

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_distance_hidden_spa_returns_404(self, client):
        """Test distance không trả về spa hidden."""
        spa = create_spa(name="Hidden Distance", status="hidden")

        response = client.get(f"/api/v1/spas/{spa.id}/distance/?from=16.067,108.220")

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestSpaTreatments:
    def test_spa_treatments_returns_available_linked_treatments(self, client, therapist_user):
        """Test spa treatments trả về treatment linked và available."""
        from apps.treatments.models import Treatment

        spa = create_spa(name="Spa With Treatments")
        Treatment.objects.create(
            therapist=therapist_user,
            spa=spa,
            name="Massage Spa",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("300000"),
            duration_minutes=60,
            image_url="https://example.com/treatment.jpg",
        )
        Treatment.objects.create(
            therapist=therapist_user,
            spa=spa,
            name="Hidden Treatment",
            category="recovery",
            description="Desc",
            price=Decimal("200000"),
            duration_minutes=30,
            image_url="https://example.com/hidden.jpg",
            is_available=False,
        )

        response = client.get(f"/api/v1/spas/{spa.id}/treatments/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 1
        assert data["results"][0]["name"] == "Massage Spa"

    def test_hidden_spa_treatments_returns_empty(self, client, therapist_user):
        """Test treatments của spa hidden không public."""
        from apps.treatments.models import Treatment

        spa = create_spa(name="Hidden Spa With Treatments", status="hidden")
        Treatment.objects.create(
            therapist=therapist_user,
            spa=spa,
            name="Hidden Spa Treatment",
            category="neck_shoulder",
            description="Desc",
            price=Decimal("300000"),
            duration_minutes=60,
            image_url="https://example.com/treatment.jpg",
        )

        response = client.get(f"/api/v1/spas/{spa.id}/treatments/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert len(data["results"]) == 0
