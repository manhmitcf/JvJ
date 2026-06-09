"""Spa views: public listing/detail, nearby search và distance API."""
from django.core.exceptions import ImproperlyConfigured
from django.db import DatabaseError

try:
    from django.contrib.gis.db.models.functions import Distance
    from django.contrib.gis.geos import Point
    from django.contrib.gis.measure import D
except Exception:  # pragma: no cover - phụ thuộc GDAL local
    Distance = None
    Point = None
    D = None
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.pagination import StandardPagination

from .models import GIS_AVAILABLE, Spa
from .serializers import SpaPublicSerializer


class DataWrappedListMixin:
    """Wrap list response theo chuẩn {data, meta}."""

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginator = self.paginator
            return Response(
                {
                    "data": {
                        "count": paginator.page.paginator.count,
                        "next": paginator.get_next_link(),
                        "previous": paginator.get_previous_link(),
                        "results": serializer.data,
                    },
                    "meta": {
                        "page": paginator.page.number,
                        "per_page": paginator.get_page_size(request),
                    },
                }
            )
        serializer = self.get_serializer(queryset, many=True)
        return Response({"data": {"results": serializer.data}})


class SpaListAPIView(DataWrappedListMixin, generics.ListAPIView):
    """GET /api/v1/spas/ — Danh sách spa đang active."""

    permission_classes = [permissions.AllowAny]
    serializer_class = SpaPublicSerializer
    pagination_class = StandardPagination
    filterset_fields = ["district"]
    search_fields = ["name", "address", "description"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        return Spa.objects.filter(status="active")


class SpaDetailAPIView(generics.RetrieveAPIView):
    """GET /api/v1/spas/:id/ — Chi tiết spa active."""

    permission_classes = [permissions.AllowAny]
    serializer_class = SpaPublicSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Spa.objects.filter(status="active")

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        return Response({"data": response.data})


class SpaTreatmentsAPIView(DataWrappedListMixin, generics.ListAPIView):
    """GET /api/v1/spas/:id/treatments/ — Treatments liên kết spa của spa active."""

    permission_classes = [permissions.AllowAny]
    pagination_class = StandardPagination

    def get_serializer_class(self):
        from apps.treatments.serializers import TreatmentPublicSerializer
        return TreatmentPublicSerializer

    def get_queryset(self):
        from apps.treatments.models import Treatment
        return Treatment.objects.filter(
            spa_id=self.kwargs["id"],
            spa__status="active",
            is_available=True,
        ).select_related("therapist")


class SpaNearbyAPIView(DataWrappedListMixin, generics.ListAPIView):
    """GET /api/v1/spas/nearby/?near=lat,lng&radius=km — Spa gần tọa độ."""

    permission_classes = [permissions.AllowAny]
    serializer_class = SpaPublicSerializer
    pagination_class = StandardPagination

    def _parse_near(self):
        near_param = self.request.query_params.get("near")
        if not near_param:
            return None
        try:
            lat, lng = map(float, near_param.split(","))
        except (TypeError, ValueError):
            return None
        return lat, lng

    def _parse_radius(self):
        try:
            radius_km = float(self.request.query_params.get("radius", 10))
        except (TypeError, ValueError):
            return None
        if radius_km <= 0:
            return None
        return radius_km

    def get_queryset(self):
        parsed = self._parse_near()
        radius_km = self._parse_radius()
        if parsed is None or radius_km is None:
            return Spa.objects.none()

        lat, lng = parsed
        base_queryset = Spa.objects.filter(status="active")

        if GIS_AVAILABLE:
            try:
                user_location = Point(lng, lat, srid=4326)
                return (
                    base_queryset.filter(location__distance_lte=(user_location, D(km=radius_km)))
                    .annotate(distance_km=Distance("location", user_location))
                    .order_by("distance_km")
                )
            except (DatabaseError, ImproperlyConfigured, ValueError, TypeError, AttributeError):
                pass

        spas = list(base_queryset)
        for spa in spas:
            spa.distance_km = spa.distance_to(lat, lng)
        spas = [spa for spa in spas if spa.distance_km <= radius_km]
        spas.sort(key=lambda spa: spa.distance_km)
        return spas


class SpaDistanceAPIView(APIView):
    """GET /api/v1/spas/:id/distance/?from=lat,lng — Tính khoảng cách tới spa."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, id):
        from_param = request.query_params.get("from")
        if not from_param:
            return Response(
                {"error": {"code": "MISSING_PARAM", "message": "Tham số 'from=lat,lng' là bắt buộc"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            lat, lng = map(float, from_param.split(","))
        except (TypeError, ValueError):
            return Response(
                {"error": {"code": "INVALID_PARAM", "message": "Định dạng 'from' không hợp lệ. Dùng lat,lng"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            spa = Spa.objects.get(id=id, status="active")
        except Spa.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Không tìm thấy spa"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        distance_km = spa.distance_to(lat, lng)
        return Response(
            {
                "data": {
                    "spa_id": str(spa.id),
                    "spa_name": spa.name,
                    "distance_km": round(distance_km, 2),
                    "from_lat": lat,
                    "from_lng": lng,
                }
            },
            status=status.HTTP_200_OK,
        )
