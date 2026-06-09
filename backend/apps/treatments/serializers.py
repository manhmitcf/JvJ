"""Serializers cho Treatment CRUD."""
from decimal import Decimal

from rest_framework import serializers

from .models import Treatment


class TreatmentPublicSerializer(serializers.ModelSerializer):
    """Serializer read-only cho listing/detail public."""

    therapist_name = serializers.CharField(source="therapist.full_name", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Treatment
        fields = [
            "id",
            "therapist_id",
            "therapist_name",
            "name",
            "category",
            "description",
            "price",
            "duration_minutes",
            "rating",
            "review_count",
            "images",
            "image_url",
            "is_available",
        ]
        read_only_fields = ["id", "therapist_id", "rating", "review_count"]

    def get_image_url(self, obj):
        """Return first image as main image for backward compatibility."""
        return obj.images[0] if obj.images else ""


class TreatmentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho tạo/cập nhật treatment (therapist/admin only)."""

    class Meta:
        model = Treatment
        fields = [
            "id",
            "name",
            "category",
            "description",
            "price",
            "duration_minutes",
            "images",
            "is_available",
        ]
        read_only_fields = ["id"]

    def validate_images(self, value):
        """Validate max 5 images."""
        if not value:
            raise serializers.ValidationError("Cần ít nhất 1 ảnh.")
        if len(value) > 5:
            raise serializers.ValidationError("Tối đa 5 ảnh.")
        return value

    def create(self, validated_data):
        validated_data["therapist"] = self.context["request"].user
        return super().create(validated_data)

    def validate_price(self, value):
        if value < Decimal("1"):
            raise serializers.ValidationError("Giá phải lớn hơn hoặc bằng 1")
        return value
