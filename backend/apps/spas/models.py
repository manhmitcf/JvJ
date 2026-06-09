"""Spa model với hỗ trợ tọa độ và tính khoảng cách."""
import math
import uuid

from django.db import models

try:
    from django.contrib.gis.db import models as gis_models
    from django.contrib.gis.geos import Point
    GIS_AVAILABLE = True
except Exception:  # pragma: no cover - phụ thuộc GDAL local
    gis_models = None
    Point = None
    GIS_AVAILABLE = False


class Spa(models.Model):
    """Địa điểm spa với thông tin liên hệ và vị trí bản đồ."""

    STATUS_CHOICES = [
        ("active", "Active"),
        ("hidden", "Hidden"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField()
    district = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    if GIS_AVAILABLE:
        location = gis_models.PointField(geography=True, srid=4326, null=True, editable=False)
    else:
        location = models.JSONField(null=True, editable=False)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    open_time = models.TimeField()
    close_time = models.TimeField()
    description = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="active")
    image_urls = models.JSONField(default=list, blank=True)
    linked_treatment_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "spas_spa"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["district"]),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        """Tự tạo/cập nhật location từ latitude/longitude mỗi lần lưu."""
        if self.latitude is not None and self.longitude is not None:
            self.location = make_location(float(self.longitude), float(self.latitude))
        super().save(*args, **kwargs)

    def hide(self):
        """Ẩn spa khỏi public listing."""
        self.status = "hidden"
        self.save(update_fields=["status", "updated_at"])

    def distance_to(self, latitude: float, longitude: float) -> float:
        """Tính khoảng cách km tới một tọa độ bằng Haversine fallback ổn định cho dev/test."""
        return haversine_km(float(self.latitude), float(self.longitude), float(latitude), float(longitude))


def make_location(longitude: float, latitude: float):
    """Tạo geometry PostGIS nếu có GDAL, fallback GeoJSON dict cho Windows local."""
    if GIS_AVAILABLE and Point is not None:
        return Point(longitude, latitude, srid=4326)
    return {"type": "Point", "coordinates": [longitude, latitude], "srid": 4326}


def location_xy(location):
    """Lấy (x, y) từ PointField hoặc GeoJSON fallback."""
    if hasattr(location, "x") and hasattr(location, "y"):
        return location.x, location.y
    if isinstance(location, dict):
        coordinates = location.get("coordinates", [None, None])
        return coordinates[0], coordinates[1]
    return None, None


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Tính khoảng cách Haversine theo km."""
    radius_km = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c
