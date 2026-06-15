from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.bookings.models import Booking
from apps.spas.models import Spa
from apps.spas.serializers import SpaPublicSerializer
from apps.therapists.models import TherapistProfile
from apps.treatments.models import Treatment

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
            "status", "years_of_experience", "specialties", "service_areas", "rating",
            "completed_bookings", "certificate_urls", "rejection_reason",
            "reviewed_by", "reviewed_at", "created_at", "updated_at",
            "pending_citizen_id", "pending_citizen_id_front_url",
            "pending_citizen_id_back_url", "pending_certificate_urls",
            "citizen_id", "citizen_id_front_url", "citizen_id_back_url",
        ]


class AdminTherapistRejectSerializer(serializers.Serializer):
    """Body cho reject — reason là bắt buộc."""
    reason = serializers.CharField(min_length=1, max_length=1000)


class AdminCredentialUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho credential update review — approved therapists có pending fields."""
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_phone = serializers.CharField(source="user.phone", read_only=True)
    user_avatar_url = serializers.URLField(source="user.avatar_url", read_only=True)
    has_pending_cccd = serializers.SerializerMethodField()
    has_pending_certificates = serializers.SerializerMethodField()
    credential_update_status = serializers.CharField(read_only=True)

    class Meta:
        model = TherapistProfile
        fields = [
            "id", "user_email", "user_full_name", "user_phone", "user_avatar_url",
            "status", "credential_update_status", "years_of_experience", "specialties", "service_areas",
            "pending_citizen_id", "pending_citizen_id_front_url",
            "pending_citizen_id_back_url", "pending_certificate_urls",
            "citizen_id", "citizen_id_front_url", "citizen_id_back_url",
            "certificate_urls",
            "has_pending_cccd", "has_pending_certificates",
            "updated_at",
        ]
        read_only_fields = fields

    def get_has_pending_cccd(self, obj):
        return bool(obj.pending_citizen_id_front_url or obj.pending_citizen_id_back_url)

    def get_has_pending_certificates(self, obj):
        return bool(obj.pending_certificate_urls)


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

AdminSpaListSerializer = SpaPublicSerializer


class AdminSpaCreateSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    linked_treatment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Spa
        fields = [
            "id", "name", "address", "district",
            "phone", "email", "open_time", "close_time", "description",
            "latitude", "longitude", "image",
            "image_urls", "status", "linked_treatment_count",
        ]


class AdminSpaUpdateSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, read_only=True)
    linked_treatment_count = serializers.IntegerField(read_only=True)
    linked_treatments = serializers.SerializerMethodField()

    class Meta:
        model = Spa
        fields = [
            "id", "name", "address", "district", "latitude", "longitude",
            "phone", "email", "open_time", "close_time", "description",
            "status",
            "image",
            "image_urls", "linked_treatment_count", "linked_treatments",
        ]
        read_only_fields = ["id", "latitude", "longitude", "linked_treatment_count"]

    def get_linked_treatments(self, obj):
        treatments = getattr(obj, "_prefetched_objects", {}).get("treatments") or obj.treatments.filter(is_available=True)
        return [
            {
                "id": str(t.id),
                "therapist_id": str(t.therapist_id),
                "therapist_name": t.therapist.full_name,
                "name": t.name,
                "category": t.category,
                "description": t.description,
                "price": str(t.price),
                "duration_minutes": t.duration_minutes,
                "rating": float(t.rating),
                "images": t.images or [],
                "image_url": t.images[0] if t.images else "",
                "is_available": t.is_available,
            }
            for t in treatments
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["image_urls"] = instance.image_urls or []
        return data

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


class AdminSpaLinkTreatmentsSerializer(serializers.Serializer):
    """POST /api/v1/admin/spas/:id/link-treatments/ — Liên kết treatment với spa."""

    treatment_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=True,
        help_text="Danh sách UUID của treatments muốn liên kết. Truyền [] để xóa toàn bộ liên kết.",
    )

    def validate_treatment_ids(self, value):
        # Ensure all treatment IDs exist and are available
        existing = Treatment.objects.filter(id__in=value, is_available=True)
        if existing.count() != len(value):
            found_ids = set(str(t.id) for t in existing)
            missing = [str(i) for i in value if str(i) not in found_ids]
            raise serializers.ValidationError(f"Không tìm thấy treatment: {missing}")
        return value

    def update(self, instance, validated_data):
        treatment_ids = validated_data["treatment_ids"]
        treatments = Treatment.objects.filter(id__in=treatment_ids)
        # Set spa for all treatments (and clear others if any)
        Treatment.objects.filter(spa=instance).exclude(id__in=treatment_ids).update(spa=None)
        treatments.update(spa=instance)
        # Update linked count on spa
        instance.linked_treatment_count = instance.treatments.filter(is_available=True).count()
        instance.save(update_fields=["linked_treatment_count", "updated_at"])
        return instance
