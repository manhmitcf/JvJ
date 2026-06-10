"""TimeSlot serializers."""
from datetime import datetime, timedelta
from rest_framework import serializers

from .models import TimeSlot


class TimeSlotSerializer(serializers.ModelSerializer):
    therapist_name = serializers.SerializerMethodField()
    treatment_name = serializers.SerializerMethodField()
    spa_id = serializers.SerializerMethodField()
    spa_name = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = [
            "id", "therapist", "therapist_name", "treatment", "treatment_name",
            "spa_id", "spa_name",
            "date", "start_time", "end_time", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_therapist_name(self, obj):
        return obj.therapist.full_name

    def get_treatment_name(self, obj):
        return obj.treatment.name if obj.treatment else ""

    def get_spa_id(self, obj):
        if obj.treatment and obj.treatment.spa_id:
            return str(obj.treatment.spa_id)
        return None

    def get_spa_name(self, obj):
        if obj.treatment and obj.treatment.spa:
            return obj.treatment.spa.name
        return ""


class TimeSlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["treatment", "date", "start_time", "end_time", "status"]
        extra_kwargs = {
            "treatment": {"required": False, "allow_null": True},
            "status": {"required": False},
        }

    def validate(self, attrs):
        date = attrs.get("date")
        start_time = attrs.get("start_time")
        end_time = attrs.get("end_time")
        therapist = self.context["request"].user

        # Only validate time overlap when time fields are present (PATCH with status-only is OK)
        if date and start_time and end_time:
            if end_time <= start_time:
                raise serializers.ValidationError("end_time phải sau start_time")

            # Exclude self when updating so we don't falsely flag our own slot as an overlap
            queryset = TimeSlot.objects.filter(
                therapist=therapist,
                date=date,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError("Khung giờ này bị trùng với lịch đã tồn tại")

        return attrs


class BulkTimeSlotSerializer(serializers.Serializer):
    """Serializer cho bulk create timeslots."""
    therapist_id = serializers.UUIDField()
    treatment_id = serializers.UUIDField()
    date = serializers.DateField()
    start_times = serializers.ListField(child=serializers.TimeField(), allow_empty=False)
    duration_minutes = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        date = attrs["date"]
        duration_minutes = attrs["duration_minutes"]
        start_times = sorted(attrs["start_times"])  # sort to detect intra-batch overlaps
        therapist_id = attrs["therapist_id"]

        for i, st in enumerate(start_times):
            end_minutes = st.hour * 60 + st.minute + duration_minutes
            if end_minutes > 24 * 60:
                raise serializers.ValidationError(
                    f"Slot bắt đầu {st} với duration {duration_minutes} phút vượt quá 24h"
                )
            end_time = (datetime.combine(date, st) + timedelta(minutes=duration_minutes)).time()

            # Check overlap with existing slots in DB
            overlapping = TimeSlot.objects.filter(
                therapist_id=therapist_id,
                date=date,
                start_time__lt=end_time,
                end_time__gt=st,
            ).exists()
            if overlapping:
                raise serializers.ValidationError(f"Slot bắt đầu {st} bị trùng với lịch đã tồn tại")

            # Check intra-batch overlap with slots declared earlier in this request
            for prev_st in start_times[:i]:
                prev_end = (datetime.combine(date, prev_st) + timedelta(minutes=duration_minutes)).time()
                if prev_st < end_time and st < prev_end:
                    raise serializers.ValidationError(
                        f"Hai slot trong batch bị trùng: {prev_st} và {st}"
                    )

        return attrs
