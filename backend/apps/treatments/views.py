"""Treatment views: public listing/detail, therapist CRUD."""
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.common.pagination import StandardPagination

from .models import Treatment
from .serializers import TreatmentCreateUpdateSerializer, TreatmentPublicSerializer


class IsTherapistOrAdmin(permissions.BasePermission):
    """Cho phép đọc công khai; chỉ therapist/admin được ghi."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ("therapist", "admin")


class TreatmentListAPIView(generics.ListCreateAPIView):
    """GET /api/v1/treatments/ — Danh sách treatment công khai.
    POST /api/v1/treatments/ — Tạo treatment (therapist/admin).
    """

    permission_classes = [IsTherapistOrAdmin]
    pagination_class = StandardPagination
    filterset_fields = ["category", "is_available"]
    search_fields = ["name", "description"]
    ordering_fields = ["rating", "price", "created_at", "name"]
    ordering = ["-rating"]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TreatmentCreateUpdateSerializer
        return TreatmentPublicSerializer

    def get_queryset(self):
        # Nếu therapist authenticated, trả hết treatments của họ (kể cả tạm ẩn)
        # Còn lại (public/customer/admin) chỉ thấy available
        if self.request.user.is_authenticated and self.request.user.role == "therapist":
            return Treatment.objects.filter(
                therapist_id=self.request.user.id,
            ).select_related("therapist")

        return Treatment.objects.filter(
            is_available=True,
        ).select_related("therapist")

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        # Wrap theo chuẩn {"data": {...}}
        return Response({"data": response.data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        # Serialize lại bằng public serializer để có đủ id, therapist_id, therapist_name
        public_data = TreatmentPublicSerializer(serializer.instance).data
        headers = self.get_success_headers(serializer.data)
        return Response({"data": public_data}, status=status.HTTP_201_CREATED, headers=headers)


class TreatmentDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PUT/DELETE /api/v1/treatments/:id/ — Chi tiết / Cập nhật / Xóa treatment."""

    permission_classes = [IsTherapistOrAdmin]
    lookup_field = "id"

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return TreatmentCreateUpdateSerializer
        return TreatmentPublicSerializer

    def get_queryset(self):
        # Anonymous user hoặc customer: chỉ xem treatments available
        if not self.request.user.is_authenticated or self.request.user.role == "customer":
            return Treatment.objects.filter(is_available=True).select_related("therapist")

        # Therapist có thể xem/sửa/xóa treatments của mình kể cả khi is_available=False
        if self.request.user.role == "therapist":
            return Treatment.objects.filter(therapist_id=self.request.user.id).select_related("therapist")

        # Admin xem được tất cả
        if self.request.user.role == "admin":
            return Treatment.objects.all().select_related("therapist")

        # Fallback: chỉ xem available
        return Treatment.objects.filter(is_available=True).select_related("therapist")

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"data": response.data})

    def update(self, request, *args, **kwargs):
        treatment = self.get_object()
        # Chỉ authenticated user mới update được
        if not request.user.is_authenticated:
            raise PermissionDenied("Bạn cần đăng nhập để thực hiện thao tác này")
        # Therapist chỉ update own; admin update được tất cả
        if request.user.role != "admin" and treatment.therapist_id != request.user.id:
            raise PermissionDenied("Bạn không có quyền sửa dịch vụ này")
        response = super().update(request, *args, **kwargs)
        return Response({"data": response.data})

    def destroy(self, request, *args, **kwargs):
        treatment = self.get_object()
        # Chỉ authenticated user mới delete được
        if not request.user.is_authenticated:
            raise PermissionDenied("Bạn cần đăng nhập để thực hiện thao tác này")
        # Therapist chỉ delete own; admin delete được tất cả
        if request.user.role != "admin" and treatment.therapist_id != request.user.id:
            raise PermissionDenied("Bạn không có quyền xóa dịch vụ này")

        # Hard delete - xóa thật khỏi database
        treatment.delete()

        return Response(
            {"data": {"message": "Liệu trình đã được xóa"}},
            status=status.HTTP_200_OK,
        )
