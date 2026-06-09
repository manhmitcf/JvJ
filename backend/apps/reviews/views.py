from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.common.pagination import StandardPagination
from apps.bookings.models import Booking

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
        if Review.objects.filter(booking=booking).exists():
            return Response(
                {"error": {"code": "DUPLICATE", "message": "Đã review booking này"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

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
