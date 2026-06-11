from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import logging
from apps.common.pagination import StandardPagination
from apps.bookings.models import Booking

logger = logging.getLogger(__name__)

from .models import Review
from .serializers import ReviewCreateSerializer, ReviewSerializer


class ReviewCreateView(APIView):
    """POST /api/v1/reviews/ — Tạo review cho booking completed."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        if not booking_id:
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "message": "Cần booking_id"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Booking không tồn tại"}},
                status=status.HTTP_404_NOT_FOUND,
            )
        if booking.status != "completed":
            return Response(
                {"error": {"code": "INVALID_STATUS", "message": "Chỉ review booking hoàn thành"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ReviewCreateSerializer(data=request.data)
        if not serializer.is_valid():
            logger.error("Review validation errors: %s | payload: %s", serializer.errors, request.data)
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "message": "Dữ liệu không hợp lệ", "details": serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = Review.objects.filter(booking=booking).first()
        if existing:
            for attr, value in serializer.validated_data.items():
                if attr != "treatment_id":
                    setattr(existing, attr, value)
            existing.save()
            return Response({"data": ReviewSerializer(existing).data}, status=status.HTTP_200_OK)

        review = Review.objects.create_review(
            booking=booking,
            customer=request.user,
            therapist=booking.therapist,
            treatment=serializer.validated_data["treatment_id"],
            rating=serializer.validated_data["rating"],
            comment=serializer.validated_data["comment"],
            tags=serializer.validated_data.get("tags", []),
        )
        return Response({"data": ReviewSerializer(review).data}, status=status.HTTP_201_CREATED)


class MyReviewsView(APIView):
    """POST /api/v1/reviews/my/ — Lấy review status cho nhiều bookings (customer only).
    Body: { "booking_ids": ["uuid1", "uuid2", ...] }
    Returns: { "data": { "booking_id": ReviewDto|null, ... } }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        booking_ids = request.data.get("booking_ids", [])
        if not isinstance(booking_ids, list):
            return Response(
                {"error": {"code": "VALIDATION_ERROR", "message": "booking_ids phải là danh sách"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        reviews = Review.objects.filter(
            booking_id__in=booking_ids, customer=request.user
        ).select_related("booking", "therapist", "treatment")

        result = {str(bid): None for bid in booking_ids}
        for review in reviews:
            result[str(review.booking_id)] = ReviewSerializer(review).data
        return Response({"data": result}, status=status.HTTP_200_OK)


class BookingReviewView(APIView):
    """GET /api/v1/reviews/bookings/:booking_id/ — Lấy review của một booking (chỉ chủ booking)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(id=booking_id, customer=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Booking không tồn tại"}},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            review = Review.objects.get(booking=booking, customer=request.user)
        except Review.DoesNotExist:
            return Response({"data": None}, status=status.HTTP_200_OK)
        return Response({"data": ReviewSerializer(review).data}, status=status.HTTP_200_OK)


class TherapistReviewsView(generics.ListAPIView):
    """GET /api/v1/reviews/therapists/:id/ — Public reviews của therapist."""
    permission_classes = [permissions.AllowAny]
    serializer_class = ReviewSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return Review.objects.filter(
            therapist_id=self.kwargs["id"], is_visible=True,
        ).select_related("customer", "treatment").order_by("-created_at")

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        return Response({"data": response.data})


class TreatmentReviewsView(generics.ListAPIView):
    """GET /api/v1/reviews/treatments/:id/ — Public reviews của treatment."""
    permission_classes = [permissions.AllowAny]
    serializer_class = ReviewSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return Review.objects.filter(
            treatment_id=self.kwargs["id"], is_visible=True,
        ).select_related("customer").order_by("-created_at")

    def get_paginated_response(self, data):
        response = super().get_paginated_response(data)
        return Response({"data": response.data})
