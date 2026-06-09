"""Therapist views: public listing/detail, đăng ký apply, dashboard metrics, profile edit."""
import os
import uuid
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.db.models import Count, Q, Sum
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bookings.models import Booking
from apps.common.pagination import StandardPagination

from .models import TherapistProfile
from .serializers import (
    TherapistApplySerializer,
    TherapistOnlineToggleSerializer,
    TherapistProfileSerializer,
    TherapistPublicSerializer,
)

User = get_user_model()


# File upload constants
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
ALLOWED_DOCUMENT_TYPES = ALLOWED_IMAGE_TYPES + ['application/pdf']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_file(file: InMemoryUploadedFile, allowed_types: list, field_name: str) -> None:
    """Validate file type and size."""
    if file.content_type not in allowed_types:
        raise ValueError(f"{field_name}: File type không hợp lệ. Chỉ chấp nhận {', '.join(allowed_types)}")

    if file.size > MAX_FILE_SIZE:
        raise ValueError(f"{field_name}: File quá lớn. Tối đa 5MB")


def save_file(file: InMemoryUploadedFile, folder: str, request) -> str:
    """Save file to storage and return absolute URL."""
    ext = os.path.splitext(file.name)[1].lower()
    filename = f"{uuid.uuid4()}{ext}"
    path = f"uploads/therapists/{folder}/{filename}"

    saved_path = default_storage.save(path, file)
    relative_url = default_storage.url(saved_path)

    # Convert relative URL thành absolute URL
    return request.build_absolute_uri(relative_url)


@api_view(['POST'])
@parser_classes([MultiPartParser])
@permission_classes([permissions.AllowAny])
def upload_therapist_documents(request):
    """
    Upload therapist registration documents.

    PUBLIC endpoint - không cần authentication vì dùng cho đăng ký.

    Expected files:
    - portrait: Image file (jpg/png/webp, max 5MB)
    - citizen_id_front: Image file (jpg/png/webp, max 5MB)
    - citizen_id_back: Image file (jpg/png/webp, max 5MB)
    - certificates: Multiple files (jpg/png/webp/pdf, max 5MB each)

    Returns:
    {
        "portrait_url": "...",
        "citizen_id_front_url": "...",
        "citizen_id_back_url": "...",
        "certificate_urls": ["...", "..."]
    }
    """
    try:
        # Validate required files
        portrait = request.FILES.get('portrait')
        citizen_id_front = request.FILES.get('citizen_id_front')
        citizen_id_back = request.FILES.get('citizen_id_back')
        certificates = request.FILES.getlist('certificates')

        if not portrait:
            return Response(
                {"error": "Thiếu ảnh chân dung"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not citizen_id_front:
            return Response(
                {"error": "Thiếu ảnh CCCD mặt trước"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not citizen_id_back:
            return Response(
                {"error": "Thiếu ảnh CCCD mặt sau"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not certificates:
            return Response(
                {"error": "Thiếu bằng cấp/chứng chỉ"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate files
        validate_file(portrait, ALLOWED_IMAGE_TYPES, "Ảnh chân dung")
        validate_file(citizen_id_front, ALLOWED_IMAGE_TYPES, "CCCD mặt trước")
        validate_file(citizen_id_back, ALLOWED_IMAGE_TYPES, "CCCD mặt sau")

        for cert in certificates:
            validate_file(cert, ALLOWED_DOCUMENT_TYPES, "Chứng chỉ")

        # Save files
        portrait_url = save_file(portrait, "portraits", request)
        citizen_id_front_url = save_file(citizen_id_front, "cccd", request)
        citizen_id_back_url = save_file(citizen_id_back, "cccd", request)
        certificate_urls = [save_file(cert, "certificates", request) for cert in certificates]

        return Response({
            "portrait_url": portrait_url,
            "citizen_id_front_url": citizen_id_front_url,
            "citizen_id_back_url": citizen_id_back_url,
            "certificate_urls": certificate_urls,
        })

    except ValueError as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {"error": f"Lỗi khi tải file: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class TherapistListAPIView(generics.ListAPIView):
    """GET /api/v1/therapists/ — Danh sách therapist đã được duyệt."""

    permission_classes = [permissions.AllowAny]
    serializer_class = TherapistPublicSerializer
    pagination_class = StandardPagination
    filterset_fields = ["status"]
    search_fields = ["user__full_name", "specialties"]
    ordering_fields = ["rating", "completed_bookings", "years_of_experience"]
    ordering = ["-rating"]

    def get_queryset(self):
        return TherapistProfile.objects.filter(
            status="approved",
        ).select_related("user")

    def get_paginated_response(self, data):
        """Wrap paginated data in {"data": ...}."""
        response = super().get_paginated_response(data)
        return Response({"data": response.data}, status=response.status_code)


class TherapistDetailAPIView(generics.RetrieveAPIView):
    """GET /api/v1/therapists/:id/ — Chi tiết public therapist profile."""

    permission_classes = [permissions.AllowAny]
    serializer_class = TherapistPublicSerializer
    lookup_field = "user_id"
    lookup_url_kwarg = "id"

    def get_queryset(self):
        return TherapistProfile.objects.filter(
            status="approved",
        ).select_related("user")

    def retrieve(self, request, *args, **kwargs):
        """Wrap detail response in {"data": ...}."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({"data": serializer.data})


class TherapistTreatmentsAPIView(generics.ListAPIView):
    """GET /api/v1/therapists/:id/treatments/ — Treatments của therapist."""

    permission_classes = [permissions.AllowAny]
    pagination_class = StandardPagination

    def get_serializer_class(self):
        from apps.treatments.serializers import TreatmentPublicSerializer
        return TreatmentPublicSerializer

    def get_queryset(self):
        from apps.treatments.models import Treatment
        return Treatment.objects.filter(
            therapist_id=self.kwargs["id"],
            is_available=True,
        ).select_related("therapist")

    def get_paginated_response(self, data):
        """Wrap paginated data in {"data": ...}."""
        response = super().get_paginated_response(data)
        return Response({"data": response.data}, status=response.status_code)


class TherapistApplyView(APIView):
    """POST /api/v1/therapists/apply/ — Gửi hồ sơ đăng ký therapist."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Kiểm tra đã có profile chưa — ưu tiên kiểm tra profile trước
        if hasattr(request.user, "therapist_profile"):
            profile = request.user.therapist_profile
            if profile.status == "approved":
                return Response(
                    {"error": {"code": "ALREADY_APPROVED", "message": "Bạn đã là Therapist"}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if profile.status == "suspended":
                return Response(
                    {"error": {"code": "SUSPENDED", "message": "Tài khoản Therapist của bạn đã bị đình chỉ"}},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Cập nhật profile bị reject hoặc pending
            serializer = TherapistApplySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            profile.years_of_experience = serializer.validated_data["years_of_experience"]
            profile.specialties = serializer.validated_data["specialties"]
            profile.certificate_urls = serializer.validated_data.get("certificate_urls", [])
            profile.status = "pending_approval"
            profile.rejection_reason = ""
            profile.save()
            return Response(
                {"data": {"message": "Hồ sơ đã được gửi lại để duyệt"}},
                status=status.HTTP_200_OK,
            )

        # Chỉ customer mới được tạo profile mới
        if request.user.role != "customer":
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Chỉ Customer mới có thể đăng ký Therapist"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TherapistApplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Tạo profile mới
        TherapistProfile.objects.create(
            user=request.user,
            years_of_experience=serializer.validated_data["years_of_experience"],
            specialties=serializer.validated_data["specialties"],
            certificate_urls=serializer.validated_data.get("certificate_urls", []),
            status="pending_approval",
        )

        # Đổi role user thành therapist
        request.user.role = "therapist"
        request.user.save(update_fields=["role", "updated_at"])

        return Response(
            {"data": {"message": "Hồ sơ đăng ký đã được gửi. Vui lòng chờ duyệt."}},
            status=status.HTTP_201_CREATED,
        )


class TherapistApplyStatusView(APIView):
    """GET /api/v1/therapists/apply/status/ — Xem trạng thái hồ sơ."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, "therapist_profile"):
            return Response(
                {"data": {"has_profile": False}},
                status=status.HTTP_200_OK,
            )

        profile = request.user.therapist_profile
        return Response(
            {
                "data": {
                    "has_profile": True,
                    "status": profile.status,
                    "rejection_reason": profile.rejection_reason,
                    "reviewed_at": profile.reviewed_at,
                }
            },
            status=status.HTTP_200_OK,
        )


class TherapistDashboardView(APIView):
    """GET /api/v1/therapist/dashboard/ — Dashboard metrics cho therapist."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "therapist":
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Chỉ dành cho Therapist"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        therapist = request.user
        now = timezone.localtime(timezone.now())
        today = now.date()
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Pending count
        pending_count = Booking.objects.filter(
            therapist=therapist, status="pending"
        ).count()

        # Completed count
        completed_count = Booking.objects.filter(
            therapist=therapist, status="completed"
        ).count()

        # Today's appointments (confirmed + in_progress)
        today_qs = Booking.objects.filter(
            therapist=therapist,
            timeslot__date=today,
            status__in=["confirmed", "in_progress"],
        ).select_related("customer", "treatment", "timeslot").order_by("timeslot__start_time")

        today_appointments = []
        for b in today_qs:
            today_appointments.append({
                "id": str(b.id),
                "code": b.code,
                "customer_name": b.customer.full_name,
                "treatment_name": b.treatment.name,
                "start_time": b.timeslot.start_time.strftime("%H:%M"),
                "end_time": b.timeslot.end_time.strftime("%H:%M"),
                "address": b.address,
                "status": b.status,
            })

        # Monthly revenue (only completed this month)
        monthly_revenue_result = Booking.objects.filter(
            therapist=therapist,
            status="completed",
            completed_at__gte=month_start,
        ).aggregate(total=Sum("total_amount"))
        monthly_revenue = monthly_revenue_result["total"] or 0

        # Rating from profile
        rating = 0.0
        if hasattr(therapist, "therapist_profile"):
            rating = float(therapist.therapist_profile.rating)

        return Response({
            "data": {
                "pending_count": pending_count,
                "completed_count": completed_count,
                "today_appointments": today_appointments,
                "monthly_revenue": int(monthly_revenue),
                "rating": rating,
            }
        })


class TherapistProfileView(APIView):
    """GET /api/v1/therapists/profile/ — Xem profile.
    PUT /api/v1/therapists/profile/ — Cập nhật profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != "therapist":
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Chỉ dành cho Therapist"}},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not hasattr(request.user, "therapist_profile"):
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Chưa có hồ sơ Therapist"}},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = TherapistProfileSerializer(request.user.therapist_profile)
        return Response({"data": serializer.data})

    def put(self, request):
        if request.user.role != "therapist":
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Chỉ dành cho Therapist"}},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not hasattr(request.user, "therapist_profile"):
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Chưa có hồ sơ Therapist"}},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = TherapistProfileSerializer(
            instance=request.user.therapist_profile, data=request.data,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"data": serializer.data})


class TherapistOnlineToggleView(APIView):
    """PATCH /api/v1/therapists/profile/status/ — Toggle online."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        if request.user.role != "therapist":
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Chỉ dành cho Therapist"}},
                status=status.HTTP_403_FORBIDDEN,
            )
        if not hasattr(request.user, "therapist_profile"):
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Chưa có hồ sơ Therapist"}},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = TherapistOnlineToggleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = request.user.therapist_profile
        profile.is_online = serializer.validated_data["is_online"]
        profile.save(update_fields=["is_online"])
        return Response({"data": {"is_online": profile.is_online}})
