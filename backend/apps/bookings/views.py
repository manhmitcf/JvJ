"""Booking views: create, list, detail, cancel."""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.pagination import StandardPagination

from .models import Booking
from .serializers import (
    BookingActionSerializer,
    BookingCreateSerializer,
    BookingDetailSerializer,
)


def _send_booking_status_notification(booking, new_status, old_status, actor=None):
    """Explicitly send notification when booking status changes.
    
    This is a fallback mechanism to ensure notifications are sent even if
    Django signals don't fire properly.
    """
    from apps.notifications.models import Notification
    
    status_type_map = {
        "confirmed": ("booking_confirmed", f"Kỹ thuật viên đã chấp nhận lịch hẹn **{booking.code}**"),
        "rejected": ("booking_rejected", f"Kỹ thuật viên đã từ chối lịch hẹn **{booking.code}**"),
        "cancelled": ("booking_cancelled", f"Lịch hẹn **{booking.code}** đã bị hủy"),
        "completed": ("booking_completed", f"Lịch hẹn **{booking.code}** hoàn thành"),
        "in_progress": ("booking_in_progress", f"Lịch hẹn **{booking.code}** đang được thực hiện"),
    }
    
    if new_status in status_type_map:
        notification_type, title = status_type_map[new_status]
        
        # Notify customer
        Notification.objects.create(
            recipient=booking.customer,
            notification_type=notification_type,
            title=title,
            message=f"Dịch vụ: {booking.treatment.name} với KTV {booking.therapist.full_name}",
            data={"booking_id": str(booking.id), "code": booking.code},
        )
        
        # Also notify therapist when booking is cancelled
        if new_status == "cancelled":
            actor_name = actor.full_name if actor else "khách hàng"
            Notification.objects.create(
                recipient=booking.therapist,
                notification_type="booking_cancelled",
                title=f"Lịch hẹn **{booking.code}** đã bị hủy bởi {actor_name}",
                message=f"{actor_name} đã hủy lịch hẹn dịch vụ {booking.treatment.name}",
                data={"booking_id": str(booking.id), "code": booking.code},
            )


class CustomerBookingListView(generics.ListAPIView):
    """GET /api/v1/bookings/ — List bookings của customer hiện tại."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingDetailSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return Booking.objects.filter(
            customer=self.request.user
        ).select_related("therapist", "treatment", "timeslot").order_by("-created_at")


class TherapistBookingListView(generics.ListAPIView):
    """GET /api/v1/therapist/bookings/ — List bookings của therapist hiện tại."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingDetailSerializer
    pagination_class = StandardPagination
    filterset_fields = ["status"]

    def get_queryset(self):
        return Booking.objects.filter(
            therapist=self.request.user
        ).select_related("customer", "treatment", "timeslot").order_by("-created_at")


class BookingDetailAPIView(generics.RetrieveAPIView):
    """GET /api/v1/bookings/:id/ — Detail booking (owner/admin)."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingDetailSerializer
    lookup_field = "id"

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Booking.objects.select_related(
                "customer", "therapist", "treatment", "timeslot"
            )
        return Booking.objects.filter(
            customer=user
        ).select_related("therapist", "treatment", "timeslot")


class BookingCreateView(generics.CreateAPIView):
    """POST /api/v1/bookings/create/ — Tạo booking mới (customer)."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BookingCreateSerializer

    def create(self, request, *args, **kwargs):
        # Debug logging
        print(f"[DEBUG] BookingCreateView.create() called")
        print(f"[DEBUG] User: {request.user}")
        print(f"[DEBUG] Auth: {request.auth}")
        print(f"[DEBUG] Headers: {dict(request.headers)}")
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            {"data": BookingDetailSerializer(booking).data},
            status=status.HTTP_201_CREATED,
        )


class BookingCancelView(APIView):
    """POST /api/v1/bookings/:id/cancel/ — Cancel booking (customer)."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        try:
            booking = Booking.objects.get(id=id, customer=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BookingActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if booking.status not in ("pending", "confirmed"):
            return Response(
                {"error": {"code": "INVALID_STATUS", "message": f"Không thể cancel booking đang '{booking.status}'"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = booking.status
        booking.transition("cancel", "customer", request.user, reason=serializer.validated_data.get("reason", ""))

        # Explicitly send notification (fallback for signal)
        _send_booking_status_notification(booking, booking.status, old_status, actor=request.user)

        return Response(
            {"data": BookingDetailSerializer(booking).data},
            status=status.HTTP_200_OK,
        )


class TherapistBookingActionView(APIView):
    """POST /api/v1/therapist/bookings/:id/:action/ — Therapist action (confirm/reject/start/complete)."""

    permission_classes = [permissions.IsAuthenticated]

    ACTION_MAP = {
        "confirm": ("confirm", "confirmed"),
        "reject": ("reject", "rejected"),
        "start": ("start", "in_progress"),
        "complete": ("complete", "completed"),
    }

    def post(self, request, id, action):
        if action not in self.ACTION_MAP:
            return Response(
                {"error": {"code": "INVALID_ACTION", "message": f"Action '{action}' không hợp lệ"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            booking = Booking.objects.get(id=id, therapist=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy booking"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BookingActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_name = self.ACTION_MAP[action][0]
        old_status = booking.status

        try:
            booking.transition(
                action_name, "therapist", request.user,
                reason=serializer.validated_data.get("reason", ""),
            )
        except Exception as e:
            return Response(
                {"error": {"code": "INVALID_TRANSITION", "message": str(e)}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Explicitly send notification (fallback for signal)
        _send_booking_status_notification(booking, booking.status, old_status, actor=request.user)

        return Response(
            {"data": BookingDetailSerializer(booking).data},
            status=status.HTTP_200_OK,
        )
