"""Serializers cho TherapistProfile — public listing và đăng ký."""
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import TherapistProfile

User = get_user_model()


class TherapistPublicSerializer(serializers.ModelSerializer):
    """Public therapist profile cho listing/detail (không có data nhạy)."""

    id = serializers.CharField(source="user.id", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    avatar_url = serializers.SerializerMethodField()
    treatment_count = serializers.SerializerMethodField()
    certificate_urls = serializers.SerializerMethodField()

    class Meta:
        model = TherapistProfile
        fields = [
            "id", "full_name", "email", "phone", "avatar_url",
            "status", "years_of_experience", "specialties",
            "rating", "completed_bookings", "treatment_count",
            "certificate_urls", "bio",
        ]
        read_only_fields = fields

    def get_treatment_count(self, obj):
        """Đếm số treatments của therapist này."""
        try:
            from apps.treatments.models import Treatment
        except ImportError:
            return 0
        return Treatment.objects.filter(
            therapist=obj.user,
            is_available=True,
        ).count()

    def get_certificate_urls(self, obj):
        return obj.certificate_urls if obj.certificate_urls else []

    def get_avatar_url(self, obj):
        url = getattr(obj.user, "avatar_url", "") or ""
        if url:
            return url
        return obj.portrait_url or ""


class TherapistApplySerializer(serializers.Serializer):
    """Serializer cho đăng ký therapist (2 bước)."""

    years_of_experience = serializers.IntegerField(min_value=0, required=True)
    specialties = serializers.ListField(
        child=serializers.CharField(),
        required=True,
        min_length=1,
    )
    certificate_urls = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        default=list,
    )
    service_areas = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )

    def validate_specialties(self, value):
        """Đảm bảo có ít nhất một chuyên môn."""
        if not value:
            raise serializers.ValidationError("Phải chọn ít nhất một chuyên môn")
        return value


class TherapistProfileSerializer(serializers.Serializer):
    """Serializer cho therapist tự xem/edit profile."""

    email = serializers.EmailField(read_only=True)
    phone = serializers.CharField(max_length=20, allow_blank=True, required=False)
    full_name = serializers.CharField(max_length=255, required=False)
    avatar_url = serializers.URLField(allow_blank=True, required=False)
    bio = serializers.CharField(allow_blank=True, required=False, default="")
    years_of_experience = serializers.IntegerField(min_value=0, required=False)
    specialties = serializers.ListField(child=serializers.CharField(), required=False)
    service_areas = serializers.ListField(child=serializers.CharField(), required=False)
    is_online = serializers.BooleanField(read_only=True)
    status = serializers.CharField(read_only=True)
    rating = serializers.DecimalField(max_digits=2, decimal_places=1, read_only=True)
    completed_bookings = serializers.IntegerField(read_only=True)
    certificate_urls = serializers.ListField(child=serializers.URLField(), required=False)
    portrait_url = serializers.URLField(allow_blank=True, required=False)
    citizen_id_front_url = serializers.URLField(allow_blank=True, read_only=True)
    citizen_id_back_url = serializers.URLField(allow_blank=True, read_only=True)
    citizen_id = serializers.CharField(read_only=True)
    rejection_reason = serializers.CharField(read_only=True)
    # Pending credential fields — therapist can always edit these
    pending_citizen_id = serializers.CharField(max_length=12, allow_blank=True, required=False)
    pending_citizen_id_front_url = serializers.URLField(allow_blank=True, required=False)
    pending_citizen_id_back_url = serializers.URLField(allow_blank=True, required=False)
    pending_certificate_urls = serializers.ListField(child=serializers.URLField(), required=False)

    def to_representation(self, instance):
        """instance là TherapistProfile."""
        data = super().to_representation(instance)
        data["email"] = instance.user.email
        data["id"] = str(instance.user.id)
        data["phone"] = instance.user.phone or ""
        data["full_name"] = instance.user.full_name or ""
        data["avatar_url"] = instance.user.avatar_url or ""
        data["portrait_url"] = instance.portrait_url or ""
        data["rating"] = str(instance.rating)
        data["completed_bookings"] = instance.completed_bookings
        data["is_online"] = instance.is_online
        data["status"] = instance.status
        data["certificate_urls"] = instance.certificate_urls if instance.certificate_urls else []
        data["citizen_id"] = instance.citizen_id or ""
        data["citizen_id_front_url"] = instance.citizen_id_front_url or ""
        data["citizen_id_back_url"] = instance.citizen_id_back_url or ""
        data["rejection_reason"] = instance.rejection_reason or ""
        data["service_areas"] = instance.service_areas if instance.service_areas else []
        # Pending credential fields
        data["pending_citizen_id"] = instance.pending_citizen_id or ""
        data["pending_citizen_id_front_url"] = instance.pending_citizen_id_front_url or ""
        data["pending_citizen_id_back_url"] = instance.pending_citizen_id_back_url or ""
        data["pending_certificate_urls"] = instance.pending_certificate_urls if instance.pending_certificate_urls else []
        if hasattr(instance, "bio"):
            data["bio"] = instance.bio
        else:
            data["bio"] = ""
        return data

    def update(self, instance, validated_data):
        import os
        debug = os.environ.get("DEBUG_SERIALIZER")
        print(f"[SERIALIZER] update called, keys={list(validated_data.keys())}")
        if debug:
            print(f"[SERIALIZER] validated_data={validated_data}")

        # Get user from request context (same pattern as UserSerializer)
        user = self.context["request"].user

        user_fields = []
        for field in ["full_name", "phone", "avatar_url"]:
            if field in validated_data:
                setattr(user, field, validated_data[field])
                user_fields.append(field)
        if user_fields:
            user.save(update_fields=user_fields)

        profile_fields = []
        for field in ["bio", "years_of_experience", "specialties", "service_areas"]:
            if field in validated_data and hasattr(instance, field):
                setattr(instance, field, validated_data[field])
                profile_fields.append(field)

        # Handle portrait_url
        portrait_url = validated_data.get("portrait_url")
        if portrait_url is not None:
            instance.portrait_url = portrait_url
            profile_fields.append("portrait_url")

        # Handle pending credential fields (only these are writable by therapist)
        # Only update fields that were explicitly sent and non-empty — retain old value if null/empty
        pending_citizen_id = validated_data.get("pending_citizen_id")
        if pending_citizen_id:
            instance.pending_citizen_id = pending_citizen_id
            profile_fields.append("pending_citizen_id")

        pending_citizen_id_front_url = validated_data.get("pending_citizen_id_front_url")
        if pending_citizen_id_front_url:
            instance.pending_citizen_id_front_url = pending_citizen_id_front_url
            profile_fields.append("pending_citizen_id_front_url")

        pending_citizen_id_back_url = validated_data.get("pending_citizen_id_back_url")
        if pending_citizen_id_back_url:
            instance.pending_citizen_id_back_url = pending_citizen_id_back_url
            profile_fields.append("pending_citizen_id_back_url")

        pending_certificate_urls = validated_data.get("pending_certificate_urls")
        if pending_certificate_urls:
            instance.pending_certificate_urls = pending_certificate_urls
            profile_fields.append("pending_certificate_urls")

        if any(field in profile_fields for field in ["pending_citizen_id", "pending_citizen_id_front_url", "pending_citizen_id_back_url", "pending_certificate_urls"]):
            instance.credential_update_status = "pending"
            profile_fields.append("credential_update_status")

            # Notify admins about credential update request
            from django.contrib.auth import get_user_model
            from apps.notifications.models import Notification
            User = get_user_model()
            admins = User.objects.filter(role="admin", is_active=True)
            therapist_name = getattr(instance.user, "full_name", "Unknown")
            for admin in admins:
                Notification.objects.create(
                    recipient=admin,
                    notification_type="therapist_credential_update",
                    title=f"Yêu cầu cập nhật giấy tờ từ {therapist_name}",
                    message=f"KTV đã gửi yêu cầu cập nhật CCCD/chứng chỉ. Cần Admin duyệt.",
                    data={"therapist_id": str(instance.id), "user_id": str(instance.user.id)},
                )

        if profile_fields:
            print(f"[SERIALIZER] Saving profile_fields={profile_fields}")
            instance.save(update_fields=profile_fields)
            print(f"[SERIALIZER] Saved! pending_certs={instance.pending_certificate_urls}")
        else:
            print(f"[SERIALIZER] No profile_fields to save!")

        return instance


class TherapistOnlineToggleSerializer(serializers.Serializer):
    is_online = serializers.BooleanField(required=True)
