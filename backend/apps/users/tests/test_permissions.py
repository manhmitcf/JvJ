"""Tests cho custom permissions của users app."""
from types import SimpleNamespace

from django.contrib.auth.models import AnonymousUser
import pytest

from apps.users.permissions import IsAdminUser, IsOwnerOrAdmin, RoleRequired


@pytest.mark.django_db
class TestIsOwnerOrAdmin:
    def test_owner_has_object_permission(self, user):
        """Owner được phép thao tác trên chính object của mình."""
        request = SimpleNamespace(user=user)

        assert IsOwnerOrAdmin().has_object_permission(request, None, user) is True

    def test_admin_has_object_permission_for_other_user(self, admin_user, user):
        """Admin được phép thao tác trên object của user khác."""
        request = SimpleNamespace(user=admin_user)

        assert IsOwnerOrAdmin().has_object_permission(request, None, user) is True

    def test_non_owner_non_admin_denied(self, django_user_model, user):
        """User thường không được thao tác trên object của user khác."""
        other_user = django_user_model.objects.create_user(
            email="other@example.com",
            full_name="Other User",
            password="pass123",
        )
        request = SimpleNamespace(user=other_user)

        assert IsOwnerOrAdmin().has_object_permission(request, None, user) is False

    def test_anonymous_denied(self, user):
        """Anonymous user luôn bị từ chối."""
        request = SimpleNamespace(user=AnonymousUser())

        assert IsOwnerOrAdmin().has_object_permission(request, None, user) is False


@pytest.mark.django_db
class TestIsAdminUser:
    def test_admin_has_permission(self, admin_user):
        """Admin role được phép truy cập."""
        request = SimpleNamespace(user=admin_user)

        assert IsAdminUser().has_permission(request, None) is True

    def test_customer_denied(self, user):
        """Customer role bị từ chối."""
        request = SimpleNamespace(user=user)

        assert IsAdminUser().has_permission(request, None) is False

    def test_anonymous_denied(self):
        """Anonymous user bị từ chối."""
        request = SimpleNamespace(user=AnonymousUser())

        assert IsAdminUser().has_permission(request, None) is False


@pytest.mark.django_db
class TestRoleRequired:
    def test_required_role_allowed(self, therapist_user):
        """User có role nằm trong required_roles được phép truy cập."""
        permission = RoleRequired()
        permission.required_roles = ["therapist", "admin"]
        request = SimpleNamespace(user=therapist_user)

        assert permission.has_permission(request, None) is True

    def test_role_not_required_denied(self, user):
        """User có role không nằm trong required_roles bị từ chối."""
        permission = RoleRequired()
        permission.required_roles = ["therapist", "admin"]
        request = SimpleNamespace(user=user)

        assert permission.has_permission(request, None) is False

    def test_anonymous_denied(self):
        """Anonymous user bị từ chối."""
        permission = RoleRequired()
        permission.required_roles = ["customer"]
        request = SimpleNamespace(user=AnonymousUser())

        assert permission.has_permission(request, None) is False
