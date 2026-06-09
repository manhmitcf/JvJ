"""Serializers cho Spa API và dữ liệu bản đồ."""
from rest_framework import serializers

from .models import Spa


class SpaPublicSerializer(serializers.ModelSerializer):
    """Serializer public cho spa listing/detail."""

    distance_km = serializers.SerializerMethodField()

    class Meta:
        model = Spa
        fields = [
            "id",
            "name",
            "address",
            "district",
            "latitude",
            "longitude",
            "phone",
            "email",
            "open_time",
            "close_time",
            "description",
            "status",
            "image_urls",
            "linked_treatment_count",
            "distance_km",
        ]
        read_only_fields = fields

    def get_distance_km(self, obj):
        """Trả về khoảng cách đã annotate/tính sẵn nếu có."""
        distance = getattr(obj, "distance_km", None)
        if distance is None:
            return None
        if hasattr(distance, "km"):
            return round(float(distance.km), 2)
        if hasattr(distance, "m"):
            return round(float(distance.m) / 1000, 2)
        return round(float(distance), 2)
