import pytest
from unittest.mock import patch
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.therapists.models import TherapistProfile

User = get_user_model()


@pytest.mark.django_db
class TestGoogleAuth:
    @patch("apps.users.views.GoogleOAuth.verify_id_token")
    def test_google_login_creates_new_user(self, mock_verify):
        mock_verify.return_value = {
            "sub": "google-123",
            "email": "newuser@gmail.com",
            "name": "New User",
            "picture": "https://lh3.googleusercontent.com/photo.jpg",
        }

        client = APIClient()
        response = client.post(
            "/api/v1/auth/google/",
            {
                "id_token": "fake-google-token",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert "access" in data
        assert "refresh" in data
        assert data["user"]["email"] == "newuser@gmail.com"
        assert data["user"]["full_name"] == "New User"
        assert data["user"]["role"] == "customer"

        user = User.objects.get(google_id="google-123")
        assert user.email == "newuser@gmail.com"

    @patch("apps.users.views.GoogleOAuth.verify_id_token")
    def test_google_login_accepts_google_credential_field(self, mock_verify):
        mock_verify.return_value = {
            "sub": "google-credential",
            "email": "credential@gmail.com",
            "name": "Credential User",
            "picture": "",
        }

        client = APIClient()
        response = client.post(
            "/api/v1/auth/google/",
            {
                "credential": "fake-google-credential",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["user"]["email"] == "credential@gmail.com"

    @patch("apps.users.views.GoogleOAuth.verify_id_token")
    def test_google_login_returns_existing_user(self, mock_verify):
        existing_user = User.objects.create_user(
            email="existing@gmail.com",
            full_name="Existing User",
            password=None,
            google_id="google-existing",
            role="therapist",
        )
        TherapistProfile.objects.create(
            user=existing_user,
            status="approved",
            years_of_experience=7,
            specialties=["Massage trị liệu", "Phục hồi chức năng"],
            rating=4.8,
            completed_bookings=25,
            certificate_urls=["https://example.com/cert-1.pdf"],
        )

        mock_verify.return_value = {
            "sub": "google-existing",
            "email": "existing@gmail.com",
            "name": "Existing User",
            "picture": "",
        }

        client = APIClient()
        response = client.post(
            "/api/v1/auth/google/",
            {
                "id_token": "fake-google-token",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["user"]["email"] == "existing@gmail.com"
        assert data["user"]["role"] == "therapist"
        assert data["user"]["status"] == "approved"
        assert data["user"]["years_of_experience"] == 7
        assert data["user"]["specialties"] == ["Massage trị liệu", "Phục hồi chức năng"]
        assert data["user"]["rating"] == 4.8
        assert data["user"]["completed_bookings"] == 25
        assert data["user"]["certificate_urls"] == ["https://example.com/cert-1.pdf"]

    def test_google_login_missing_id_token(self):
        client = APIClient()
        response = client.post("/api/v1/auth/google/", {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "error" in response.json()

    @patch("apps.users.views.GoogleOAuth.verify_id_token")
    def test_google_login_invalid_token_returns_400(self, mock_verify):
        """Test token Google không hợp lệ trả về lỗi 400."""
        mock_verify.side_effect = ValueError("Invalid token")

        client = APIClient()
        response = client.post(
            "/api/v1/auth/google/",
            {
                "id_token": "invalid-google-token",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["error"]["code"] == "INVALID_TOKEN"


@pytest.mark.django_db
class TestRegister:
    def test_register_customer_creates_customer_and_returns_tokens(self):
        client = APIClient()
        response = client.post(
            "/api/v1/auth/register/customer/",
            {
                "email": "customer.register@test.com",
                "password": "testpass123",
                "full_name": "Customer Register",
                "phone": "0905000111",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()["data"]
        assert "access" in data
        assert "refresh" in data
        assert data["user"]["role"] == "customer"
        assert data["user"]["email"] == "customer.register@test.com"

        user = User.objects.get(email="customer.register@test.com")
        assert user.role == "customer"
        assert user.check_password("testpass123") is True

    def test_register_therapist_creates_pending_profile(self):
        client = APIClient()
        response = client.post(
            "/api/v1/auth/register/therapist/",
            {
                "email": "therapist.register@test.com",
                "password": "testpass123",
                "full_name": "Therapist Register",
                "phone": "0905000222",
                "years_of_experience": 4,
                "specialties": ["Massage cổ vai gáy", "Vật lý trị liệu"],
                "certificate_urls": ["https://example.com/cert.pdf"],
                "bio": "Có kinh nghiệm điều trị tại nhà",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()["data"]
        assert data["user"]["role"] == "therapist"
        assert data["user"]["status"] == "pending_approval"
        assert data["user"]["years_of_experience"] == 4
        assert data["user"]["specialties"] == ["Massage cổ vai gáy", "Vật lý trị liệu"]
        assert data["user"]["certificate_urls"] == ["https://example.com/cert.pdf"]

        user = User.objects.get(email="therapist.register@test.com")
        profile = TherapistProfile.objects.get(user=user)
        assert profile.status == "pending_approval"
        assert profile.bio == "Có kinh nghiệm điều trị tại nhà"


@pytest.mark.django_db
class TestAuthMe:
    def test_get_me_returns_user_info(self, auth_client, user):
        response = auth_client.get("/api/v1/auth/me/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["email"] == user.email
        assert data["full_name"] == user.full_name
        assert data["role"] == user.role
        assert data["status"] is None
        assert data["years_of_experience"] is None
        assert data["specialties"] == []
        assert data["rating"] is None
        assert data["completed_bookings"] is None
        assert data["certificate_urls"] == []

    def test_get_me_returns_therapist_profile_fields(self, therapist_client, therapist_user):
        profile = therapist_user.therapist_profile
        profile.status = "approved"
        profile.years_of_experience = 6
        profile.specialties = ["Bấm huyệt", "Massage trị liệu"]
        profile.rating = 4.7
        profile.completed_bookings = 32
        profile.certificate_urls = ["https://example.com/cert-a.pdf"]
        profile.save()

        response = therapist_client.get("/api/v1/auth/me/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["role"] == "therapist"
        assert data["status"] == "approved"
        assert data["years_of_experience"] == 6
        assert data["specialties"] == ["Bấm huyệt", "Massage trị liệu"]
        assert data["rating"] == 4.7
        assert data["completed_bookings"] == 32
        assert data["certificate_urls"] == ["https://example.com/cert-a.pdf"]

    def test_get_me_unauthenticated(self, client):
        response = client.get("/api/v1/auth/me/")
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN,
        ]

    def test_update_me(self, auth_client, user):
        response = auth_client.put(
            "/api/v1/auth/me/",
            {
                "full_name": "Updated Name",
                "phone": "0901234567",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert data["full_name"] == "Updated Name"
        assert data["phone"] == "0901234567"

        user.refresh_from_db()
        assert user.full_name == "Updated Name"
        assert user.phone == "0901234567"

    def test_update_me_cannot_change_role(self, auth_client, user):
        response = auth_client.put(
            "/api/v1/auth/me/",
            {
                "role": "admin",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.role == "customer"


@pytest.mark.django_db
class TestTokenRefresh:
    def test_refresh_token_returns_new_tokens(self, client, user):
        refresh = RefreshToken.for_user(user)
        response = client.post(
            "/api/v1/auth/refresh/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()["data"]
        assert "access" in data
        assert "refresh" in data


@pytest.mark.django_db
class TestLogout:
    def test_logout_blacklists_refresh_token(self, auth_client, user):
        refresh = RefreshToken.for_user(user)
        refresh_token_str = str(refresh)

        response = auth_client.post(
            "/api/v1/auth/logout/",
            {
                "refresh": refresh_token_str,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["data"]["message"] == "Đăng xuất thành công"

        with pytest.raises(Exception):
            RefreshToken(refresh_token_str)

    def test_logout_requires_refresh_token(self, auth_client):
        response = auth_client.post("/api/v1/auth/logout/", {}, format="json")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["error"]["code"] == "MISSING_TOKEN"

    def test_logout_rejects_invalid_refresh_token(self, auth_client):
        response = auth_client.post(
            "/api/v1/auth/logout/",
            {"refresh": "invalid-token"},
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["error"]["code"] == "INVALID_TOKEN"

    def test_refresh_rejects_invalid_token(self, client):
        response = client.post(
            "/api/v1/auth/refresh/",
            {"refresh": "invalid-token"},
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error"]["message"]
