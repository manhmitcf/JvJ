from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.common.pagination import StandardPagination
from apps.reviews.models import Review
from apps.spas.models import Spa
from apps.therapists.models import TherapistProfile

from .serializers import (
    AdminBookingDetailSerializer,
    AdminBookingListSerializer,
    AdminSpaCreateSerializer,
    AdminSpaListSerializer,
    AdminSpaUpdateSerializer,
    AdminTherapistDetailSerializer,
    AdminTherapistRejectSerializer,
    AdminUserDetailSerializer,
    AdminUserListSerializer,
    AdminUserUpdateSerializer,
)


class IsAdminRole(permissions.BasePermission):
    """Chỉ cho phép user có role=admin."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"


class AdminStatsView(APIView):
    """GET /api/v1/admin/stats/overview/ — Dashboard KPI."""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get(self, request):
        today = timezone.now().date()
        month_start = today.replace(day=1)

        User = get_user_model()
        total_customers = User.objects.filter(role="customer").count()
        active_therapists = TherapistProfile.objects.filter(status="approved").count()
        new_bookings_today = Booking.objects.filter(created_at__date=today).count()
        pending_approvals = TherapistProfile.objects.filter(
            status="pending_approval"
        ).count()

        # Monthly revenue & completed bookings
        month_start_dt = timezone.make_aware(
            datetime.combine(month_start, datetime.min.time())
        )
        monthly = Booking.objects.filter(
            completed_at__gte=month_start_dt,
            status="completed",
        ).aggregate(
            total_revenue=Sum("total_amount"),
            completed_count=Count("id"),
        )

        # Chart 7 days: doanh thu + booking theo ngày
        seven_days_ago = today - timedelta(days=6)
        daily_stats = (
            Booking.objects
            .filter(
                payment_status="paid",
                completed_at__date__gte=seven_days_ago,
                completed_at__date__lte=today
            )
            .values('completed_at__date')
            .annotate(
                revenue=Sum('total_amount'),
                bookings=Count('id')
            )
            .order_by('completed_at__date')
        )

        # Build chart_7_days array với đủ 7 ngày
        stats_dict = {item['completed_at__date']: item for item in daily_stats}
        chart_7_days = []
        day_names = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

        for i in range(7):
            date = seven_days_ago + timedelta(days=i)
            day_of_week = day_names[date.weekday()]
            stat = stats_dict.get(date, {})

            chart_7_days.append({
                'date': date.isoformat(),
                'day_of_week': day_of_week,
                'revenue': int(stat.get('revenue', 0) or 0),
                'bookings': stat.get('bookings', 0) or 0,
            })

        # Alerts: chỉ 1 alert về therapist chờ duyệt
        alerts = []
        if pending_approvals > 0:
            alerts.append({
                'id': 'pending-therapists',
                'title': 'Hồ sơ kỹ thuật viên chờ duyệt',
                'description': f'{pending_approvals} hồ sơ cần Admin kiểm tra chứng chỉ',
                'tone': 'amber',
                'href': '/admin/therapist-approvals',
            })

        return Response({
            "data": {
                "total_customers": total_customers,
                "active_therapists": active_therapists,
                "new_bookings_today": new_bookings_today,
                "pending_therapist_approvals": pending_approvals,
                "total_revenue_month": monthly["total_revenue"] or 0,
                "completed_bookings_month": monthly["completed_count"] or 0,
                "chart_7_days": chart_7_days,
                "alerts": alerts,
            }
        })


User = get_user_model()


class AdminUserListView(generics.ListAPIView):
    """GET /api/v1/admin/users/?role=&search="""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminUserListSerializer

    def get_queryset(self):
        qs = User.objects.all().order_by("-created_at")
        role = self.request.query_params.get("role")
        search = self.request.query_params.get("search")
        if role:
            qs = qs.filter(role=role)
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone__icontains=search)
            )
        return qs

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        return Response({"data": response.data})


class AdminUserDetailView(generics.RetrieveAPIView):
    """GET /api/v1/admin/users/:id/"""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminUserDetailSerializer
    queryset = User.objects.all()
    lookup_field = "id"


class AdminUserUpdateView(generics.UpdateAPIView):
    """PATCH /api/v1/admin/users/:id/update/ — suspend/activate"""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminUserUpdateSerializer
    queryset = User.objects.all()
    lookup_field = "id"


class AdminPendingTherapistsView(generics.ListAPIView):
    """GET /api/v1/admin/therapists/pending/?status=pending_approval|approved|rejected"""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminTherapistDetailSerializer

    def get_queryset(self):
        qs = TherapistProfile.objects.select_related("user").order_by("-created_at")
        status = self.request.query_params.get("status")
        if status and status != "all":
            qs = qs.filter(status=status)
        return qs

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        return Response({"data": response.data})


class AdminTherapistDetailView(generics.RetrieveAPIView):
    """GET /api/v1/admin/therapists/:id/"""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminTherapistDetailSerializer
    queryset = TherapistProfile.objects.select_related("user")
    lookup_field = "id"

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"data": response.data})


class AdminTherapistApproveView(APIView):
    """POST /api/v1/admin/therapists/:id/approve/"""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, id):
        try:
            profile = TherapistProfile.objects.select_related("user").get(id=id)
        except TherapistProfile.DoesNotExist:
            return Response({"error": {"code": "NOT_FOUND", "message": "Hồ sơ không tồn tại"}}, status=status.HTTP_404_NOT_FOUND)

        profile.status = "approved"
        profile.reviewed_by = request.user
        profile.reviewed_at = timezone.now()
        profile.user.role = "therapist"
        profile.user.save(update_fields=["role", "updated_at"])
        profile.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        return Response({"data": {"status": "approved", "message": "Đã duyệt hồ sơ kỹ thuật viên"}})


class AdminTherapistRejectView(APIView):
    """POST /api/v1/admin/therapists/:id/reject/"""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, id):
        serializer = AdminTherapistRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            profile = TherapistProfile.objects.select_related("user").get(id=id)
        except TherapistProfile.DoesNotExist:
            return Response({"error": {"code": "NOT_FOUND", "message": "Hồ sơ không tồn tại"}}, status=status.HTTP_404_NOT_FOUND)

        profile.status = "rejected"
        profile.reviewed_by = request.user
        profile.reviewed_at = timezone.now()
        profile.rejection_reason = serializer.validated_data["reason"]
        profile.save(update_fields=["status", "reviewed_by", "reviewed_at", "rejection_reason", "updated_at"])

        return Response({"data": {"status": "rejected", "message": "Đã từ chối hồ sơ"}})


class AdminBookingListView(generics.ListAPIView):
    """GET /api/v1/admin/bookings/?status=&payment_status=&therapist="""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminBookingListSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Booking.objects.select_related("customer", "therapist", "treatment").order_by("-created_at")
        st = self.request.query_params.get("status")
        ps = self.request.query_params.get("payment_status")
        therapist = self.request.query_params.get("therapist")
        if st:
            qs = qs.filter(status=st)
        if ps:
            qs = qs.filter(payment_status=ps)
        if therapist:
            qs = qs.filter(therapist_id=therapist)
        return qs

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        return Response({"data": response.data})


class AdminBookingDetailView(generics.RetrieveAPIView):
    """GET /api/v1/admin/bookings/:id/"""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminBookingDetailSerializer
    queryset = Booking.objects.select_related("customer", "therapist", "treatment", "timeslot")
    lookup_field = "id"


class AdminBookingForceCancelView(APIView):
    """POST /api/v1/admin/bookings/:id/force-cancel/"""

    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def post(self, request, id):
        reason = request.data.get("reason", "").strip()
        if not reason:
            return Response({"error": {"code": "VALIDATION_ERROR", "message": "Lý do hủy là bắt buộc"}}, status=status.HTTP_400_BAD_REQUEST)

        try:
            booking = Booking.objects.select_related("timeslot").get(id=id)
        except Booking.DoesNotExist:
            return Response({"error": {"code": "NOT_FOUND", "message": "Booking không tồn tại"}}, status=status.HTTP_404_NOT_FOUND)

        if booking.status in ("completed", "cancelled", "rejected"):
            return Response({"error": {"code": "INVALID_STATUS", "message": f"Không thể hủy booking '{booking.status}'"}}, status=status.HTTP_400_BAD_REQUEST)

        booking.transition("force_cancel", "admin", request.user, reason=reason)
        return Response({"data": {"status": "cancelled", "message": f"Đã hủy booking {booking.code}"}})


# ─── Spa CRUD ───

class AdminSpaListCreateView(generics.ListCreateAPIView):
    """GET/POST /api/v1/admin/spas/"""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminSpaCreateSerializer
        return AdminSpaListSerializer

    def get_queryset(self):
        return Spa.objects.all().order_by("-created_at")

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        return Response({"data": response.data})

    def create(self, request, *args, **kwargs):
        resp = super().create(request, *args, **kwargs)
        return Response({"data": resp.data}, status=resp.status_code)


class AdminSpaUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/v1/admin/spas/:id/"""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    serializer_class = AdminSpaUpdateSerializer
    queryset = Spa.objects.all()
    lookup_field = "id"

    def perform_destroy(self, instance):
        # Soft delete: set status=hidden thay vì xóa thật
        instance.status = "hidden"
        instance.save(update_fields=["status", "updated_at"])


class AdminReviewVisibilityView(APIView):
    """PATCH /api/v1/admin/reviews/:id/visibility/"""
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def patch(self, request, id):
        is_visible = request.data.get("is_visible")
        if is_visible is None:
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "message": "Trường is_visible là bắt buộc"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            review = Review.objects.get(id=id)
        except Review.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Review không tồn tại"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        review.is_visible = is_visible
        review.moderated_by = request.user
        review.save(update_fields=["is_visible", "moderated_by", "updated_at"])

        return Response({"data": {"is_visible": is_visible, "message": "Đã cập nhật trạng thái hiển thị review"}})
