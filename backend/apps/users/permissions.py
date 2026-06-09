"""Custom permissions for user-related operations."""
from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access only to the owner or admin users."""

    def has_object_permission(self, request, view, obj):
        if request.user.is_anonymous:
            return False
        if obj.id == request.user.id:
            return True
        return request.user.role == "admin"


class IsAdminUser(permissions.BasePermission):
    """Allow access only to admin role users."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class RoleRequired(permissions.BasePermission):
    """Allow access only to users with specific role(s)."""

    required_roles = []

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in self.required_roles
        )
