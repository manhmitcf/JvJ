"""Custom permission classes for JvJ API."""
from rest_framework import permissions


class IsActiveUser(permissions.BasePermission):
    """
    Permission check: user must be authenticated AND is_active=True.
    Use this instead of IsAuthenticated to block suspended accounts.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_active
        )

    message = "Tài khoản đã bị tạm khóa"
