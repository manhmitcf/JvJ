from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.bookings.models import Booking
from apps.therapists.models import TherapistProfile

User = get_user_model()


class AdminUserListSerializer(serializers.ModelSerializer):
    """Serializer cho list users — include therapist profile status."""
    therapist_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "avatar_url", "role", "therapist_status", "is_active", "created_at"]

    def get_therapist_status(self, obj):
        if hasattr(obj, "therapist_profile"):
            return obj.therapist_profile.status
        return None


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Serializer cho user detail — read-only."""
    therapist_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "full_name", "phone", "avatar_url", "role", "therapist_status", "is_active", "created_at", "updated_at"]

    def get_therapist_status(self, obj):
        if hasattr(obj, "therapist_profile"):
            return obj.therapist_profile.status
        return None


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho suspend/activate user."""
    is_active = serializers.BooleanField()

    class Meta:
        model = User
        fields = ["is_active"]


class AdminTherapistDetailSerializer(serializers.ModelSerializer):
    """Detail profile therapist cho admin review."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    user_avatar_url = serializers.URLField(source="user.avatar_url", read_only=True)

    class Meta:
        model = TherapistProfile
        fields = [
            "id", "user_email", "user_full_name", "user_phone", "user_avatar_url",
            "status", "years_of_experience", "specialties", "rating",
            "completed_bookings", "certificate_urls", "rejection_reason",
            "reviewed_by", "reviewed_at", "created_at", "updated_at",
        ]


class AdminTherapistRejectSerializer(serializers.Serializer):
    """Body cho reject — reason là bắt buộc."""
    reason = serializers.CharField(min_length=1, max_length=1000)


class AdminBookingListSerializer(serializers.ModelSerializer):
    """Serializer cho list bookings."""
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    therapist_name = serializers.CharField(source="therapist.full_name", read_only=True)
    treatment_name = serializers.CharField(source="treatment.name", read_only=True)
    timeslot_date = serializers.DateField(source="timeslot.date", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "code", "customer_name", "therapist_name", "treatment_name",
            "status", "payment_status", "total_amount", "timeslot_date",
            "address", "contact_phone", "note", "created_at",
        ]


class AdminBookingDetailSerializer(serializers.ModelSerializer):
    """Serializer cho booking detail."""
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    therapist_name = serializers.CharField(source="therapist.full_name", read_only=True)
    treatment_name = serializers.CharField(source="treatment.name", read_only=True)
    timeslot_date = serializers.DateField(source="timeslot.date", read_only=True)
    timeslot_start = serializers.TimeField(source="timeslot.start_time", read_only=True)
    timeslot_end = serializers.TimeField(source="timeslot.end_time", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id", "code", "customer_name", "therapist_name", "treatment_name",
            "status", "payment_status", "total_amount", "timeslot_date",
            "timeslot_start", "timeslot_end", "address", "contact_phone",
            "note", "rejection_reason", "confirmed_at", "completed_at",
            "cancelled_at", "created_at", "updated_at",
        ]


# ─── Spa ───

from apps.spas.models import Spa
from apps.spas.serializers import SpaPublicSerializer as AdminSpaListSerializer


class AdminSpaCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spa
        fields = [
            "name", "address", "district", "latitude", "longitude",
            "phone", "email", "open_time", "close_time", "description",
            "image_urls",
        ]


class AdminSpaUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Spa
        fields = [
            "name", "address", "district", "latitude", "longitude",
            "phone", "email", "open_time", "close_time", "description",
            "status", "image_urls",
        ]
