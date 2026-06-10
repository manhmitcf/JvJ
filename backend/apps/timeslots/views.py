"""TimeSlot views: CRUD, bulk create, availability listing."""
from datetime import datetime, timedelta

from django.db import models
from django_filters import rest_framework as filters
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.pagination import StandardPagination

from .models import TimeSlot
from .serializers import BulkTimeSlotSerializer, TimeSlotCreateSerializer, TimeSlotSerializer


class TimeSlotFilter(filters.FilterSet):
    """Custom filter for TimeSlot. therapist/treatment handled in view for null-treatment support."""

    therapist = filters.UUIDFilter(field_name="therapist__id")
    treatment = filters.UUIDFilter(field_name="treatment__id")
    spa = filters.UUIDFilter(field_name="treatment__spa__id")
    status = filters.CharFilter(field_name="status")
    date = filters.DateFilter(field_name="date")

    class Meta:
        model = TimeSlot
        fields = ["therapist", "treatment", "spa", "status", "date"]


class TimeSlotListAPIView(generics.ListAPIView):
    """GET /api/v1/timeslots/ — List timeslots (public, filterable)."""
    permission_classes = [permissions.AllowAny]
    serializer_class = TimeSlotSerializer
    pagination_class = StandardPagination
    filter_backends = []  # Filters handled manually in get_queryset below

    def get_queryset(self):
        params = self.request.query_params
        therapist_id = params.get("therapist")
        treatment_id = params.get("treatment")

        queryset = TimeSlot.objects.select_related(
            "therapist", "treatment", "treatment__spa"
        )

        # Handle therapist + treatment together so we can include null-treatment slots.
        if therapist_id and treatment_id:
            queryset = queryset.filter(
                models.Q(therapist__id=therapist_id)
                & (
                    models.Q(treatment__id=treatment_id)
                    | models.Q(treatment__isnull=True)
                )
            )
        elif therapist_id:
            queryset = queryset.filter(therapist__id=therapist_id)
        elif treatment_id:
            queryset = queryset.filter(treatment__id=treatment_id)

        # Apply remaining filters directly
        if params.get("date"):
            queryset = queryset.filter(date=params["date"])
        if params.get("status"):
            queryset = queryset.filter(status=params["status"])
        if params.get("spa"):
            queryset = queryset.filter(treatment__spa__id=params["spa"])

        return queryset


class TimeSlotDetailAPIView(generics.RetrieveAPIView):
    """GET /api/v1/timeslots/:id/ — Detail timeslot."""
    permission_classes = [permissions.AllowAny]
    serializer_class = TimeSlotSerializer
    lookup_field = "id"

    def get_queryset(self):
        return TimeSlot.objects.select_related("therapist", "treatment")


class TherapistTimeSlotListAPIView(generics.ListAPIView):
    """GET /api/v1/therapist/timeslots/ — Slots của therapist hiện tại."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TimeSlotSerializer
    pagination_class = StandardPagination
    filterset_fields = ["date", "status"]

    def get_queryset(self):
        return TimeSlot.objects.filter(therapist=self.request.user).select_related("treatment").order_by("date", "start_time")


class TherapistTimeSlotCreateView(generics.CreateAPIView):
    """POST /api/v1/therapist/timeslots/create/ — Tạo timeslot mới."""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TimeSlotCreateSerializer

    def perform_create(self, serializer):
        serializer.save(therapist=self.request.user)


class TherapistTimeSlotUpdateView(generics.UpdateAPIView):
    """PUT/PATCH /api/v1/therapist/timeslots/:id/ — Update timeslot của mình."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TimeSlotCreateSerializer
    lookup_field = "id"

    http_method_names = ["get", "put", "patch", "head", "options"]

    def get_queryset(self):
        return TimeSlot.objects.filter(therapist=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        if instance.status == "booked":
            raise PermissionError("Không thể sửa slot đã có booking")
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({"data": TimeSlotSerializer(instance).data}, status=status.HTTP_200_OK)


class TherapistTimeSlotDeleteView(generics.DestroyAPIView):
    """DELETE /api/v1/therapist/timeslots/:id/ — Xóa timeslot của mình."""
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return TimeSlot.objects.filter(therapist=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status == "booked":
            return Response(
                {"error": {"code": "BOOKED_SLOT", "message": "Không thể xóa slot đã có booking"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance.delete()
        return Response({"data": {"message": "Đã xóa khung giờ"}}, status=status.HTTP_200_OK)


class TherapistBulkTimeSlotView(APIView):
    """POST /api/v1/therapist/timeslots/bulk/ — Tạo nhiều timeslots cùng lúc."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BulkTimeSlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        therapist_id = serializer.validated_data["therapist_id"]
        if therapist_id != request.user.id:
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Không thể tạo lịch cho người khác"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        treatment_id = serializer.validated_data["treatment_id"]
        date = serializer.validated_data["date"]
        start_times = serializer.validated_data["start_times"]
        duration_minutes = serializer.validated_data["duration_minutes"]

        created_slots = []
        for st in start_times:
            end_time = (datetime.combine(date, st) + timedelta(minutes=duration_minutes)).time()
            slot = TimeSlot.objects.create(
                therapist=request.user,
                treatment_id=treatment_id,
                date=date,
                start_time=st,
                end_time=end_time,
            )
            created_slots.append(slot)

        return Response(
            {"data": {"created_count": len(created_slots), "slots": TimeSlotSerializer(created_slots, many=True).data}},
            status=status.HTTP_201_CREATED,
        )
