from rest_framework import serializers
from .models import Review, VALID_TAGS


class ReviewCreateSerializer(serializers.ModelSerializer):
    booking_id = serializers.UUIDField(write_only=True)
    treatment_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Review
        fields = ["booking_id", "treatment_id", "rating", "comment", "tags"]

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating phải từ 1 đến 5")
        return value

    def validate_tags(self, value):
        for tag in value:
            if tag not in VALID_TAGS:
                raise serializers.ValidationError(f"Tag '{tag}' không hợp lệ")
        return value

    def validate_treatment_id(self, value):
        from apps.treatments.models import Treatment
        try:
            return Treatment.objects.get(pk=value)
        except Treatment.DoesNotExist:
            raise serializers.ValidationError("Treatment không tồn tại")


class ReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.full_name", read_only=True)
    customer_avatar = serializers.CharField(source="customer.avatar_url", read_only=True)
    treatment_name = serializers.CharField(source="treatment.name", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id", "customer_name", "customer_avatar", "treatment_name",
            "rating", "comment", "tags", "is_visible", "created_at",
        ]


class ReviewUpdateSerializer(serializers.Serializer):
    rating = serializers.IntegerField(min_value=1, max_value=5)
    comment = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField(), required=False, default=list)

    def validate_tags(self, value):
        for tag in value:
            if tag not in VALID_TAGS:
                raise serializers.ValidationError(f"Tag '{tag}' không hợp lệ")
        return value
