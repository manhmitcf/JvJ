"""Notification views: list, mark read, unread count."""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationCreateSerializer, NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """GET /api/v1/notifications/ — Danh sách thông báo của user hiện tại."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = None

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by("-created_at")[:50]


class UnreadCountView(APIView):
    """GET /api/v1/notifications/unread-count/ — Số thông báo chưa đọc."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
        ).count()
        return Response({"count": count})


class MarkAsReadView(APIView):
    """PATCH /api/v1/notifications/<id>/read/ — Đánh dấu đã đọc."""

    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk, recipient=request.user)
        except Notification.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy thông báo"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.is_read = True
        notification.save(update_fields=["is_read", "updated_at"])
        return Response({"data": {"id": str(notification.id), "is_read": True}})


class MarkAllReadView(APIView):
    """POST /api/v1/notifications/mark-all-read/ — Đánh dấu tất cả đã đọc."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(
            recipient=request.user,
            is_read=False,
        ).update(is_read=True)
        return Response({"data": {"marked": True}})


class NotificationCreateView(generics.CreateAPIView):
    """POST /api/v1/notifications/create/ — Tạo thông báo (internal)."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationCreateSerializer

    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)
