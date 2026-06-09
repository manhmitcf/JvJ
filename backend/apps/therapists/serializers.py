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
    avatar_url = serializers.URLField(source="user.avatar_url", read_only=True)
    treatment_count = serializers.SerializerMethodField()

    class Meta:
        model = TherapistProfile
        fields = [
            "id", "full_name", "email", "phone", "avatar_url",
            "status", "years_of_experience", "specialties",
            "rating", "completed_bookings", "treatment_count",
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
    is_online = serializers.BooleanField(read_only=True)
    status = serializers.CharField(read_only=True)
    rating = serializers.DecimalField(max_digits=2, decimal_places=1, read_only=True)
    completed_bookings = serializers.IntegerField(read_only=True)
    certificate_urls = serializers.ListField(child=serializers.URLField(), read_only=True)
    citizen_id = serializers.CharField(read_only=True)
    citizen_id_front_url = serializers.URLField(read_only=True)
    citizen_id_back_url = serializers.URLField(read_only=True)
    rejection_reason = serializers.CharField(read_only=True)

    def to_representation(self, instance):
        """instance là TherapistProfile."""
        data = super().to_representation(instance)
        data["email"] = instance.user.email
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
        if hasattr(instance, "bio"):
            data["bio"] = instance.bio
        else:
            data["bio"] = ""
        return data

    def update(self, instance, validated_data):
        user = instance.user
        profile = instance

        user_fields = []
        for field in ["full_name", "phone", "avatar_url"]:
            if field in validated_data:
                setattr(user, field, validated_data[field])
                user_fields.append(field)
        if user_fields:
            user.save(update_fields=user_fields)

        profile_fields = []
        for field in ["bio", "years_of_experience", "specialties"]:
            if field in validated_data and hasattr(profile, field):
                setattr(profile, field, validated_data[field])
                profile_fields.append(field)
        if profile_fields:
            profile.save(update_fields=profile_fields)

        return instance


class TherapistOnlineToggleSerializer(serializers.Serializer):
    is_online = serializers.BooleanField(required=True)
