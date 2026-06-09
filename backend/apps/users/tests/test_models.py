import pytest
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
class TestUserModel:
    def test_create_user_with_email(self):
        user = User.objects.create_user(
            email="test@example.com",
            full_name="Test User",
            password="testpass123",
            role="customer",
        )
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.role == "customer"
        assert user.check_password("testpass123")
        assert user.is_active is True
        assert user.pk is not None

    def test_create_user_without_email_raises_error(self):
        with pytest.raises(ValueError, match="Email is required"):
            User.objects.create_user(
                email="",
                full_name="No Email",
                password="testpass123",
            )

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            full_name="Super Admin",
            password="adminpass123",
        )
        assert admin.is_superuser is True
        assert admin.is_staff is True
        assert admin.role == "admin"

    def test_user_str_representation(self):
        user = User(
            email="test@example.com",
            full_name="Test User",
            role="customer",
        )
        assert str(user) == "test@example.com"

    def test_user_role_choices(self):
        user = User.objects.create_user(
            email="role_test@example.com",
            full_name="Role Test User",
            password="securepass123",
            role="customer",
        )
        user.full_clean()

        user.role = "invalid_role"
        with pytest.raises(ValidationError):
            user.full_clean()

    def test_google_id_unique(self):
        User.objects.create_user(
            email="user1@example.com",
            full_name="User One",
            password="pass123",
            google_id="google-123",
        )
        with pytest.raises(Exception):
            User.objects.create_user(
                email="user2@example.com",
                full_name="User Two",
                password="pass123",
                google_id="google-123",
            )

    def test_email_unique(self):
        User.objects.create_user(
            email="unique@example.com",
            full_name="User One",
            password="pass123",
        )
        with pytest.raises(Exception):
            User.objects.create_user(
                email="unique@example.com",
                full_name="User Two",
                password="pass123",
            )
