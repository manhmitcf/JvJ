"""TimeSlot serializers."""
from datetime import datetime, timedelta
from rest_framework import serializers

from .models import TimeSlot


class TimeSlotSerializer(serializers.ModelSerializer):
    therapist_name = serializers.SerializerMethodField()
    treatment_name = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = [
            "id", "therapist", "therapist_name", "treatment", "treatment_name",
            "date", "start_time", "end_time", "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_therapist_name(self, obj):
        return obj.therapist.full_name

    def get_treatment_name(self, obj):
        return obj.treatment.name if obj.treatment else ""


class TimeSlotCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = ["treatment", "date", "start_time", "end_time"]

    def validate(self, attrs):
        date = attrs["date"]
        start_time = attrs["start_time"]
        end_time = attrs["end_time"]
        # Therapist sẽ được set bởi perform_create, lấy từ context
        therapist = self.context["request"].user

        if end_time <= start_time:
            raise serializers.ValidationError("end_time phải sau start_time")

        overlapping = TimeSlot.objects.filter(
            therapist=therapist,
            date=date,
            start_time__lt=end_time,
            end_time__gt=start_time,
        ).exists()

        if overlapping:
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
        therapist_id = attrs["therapist_id"]
        treatment_id = attrs["treatment_id"]
        date = attrs["date"]
        duration_minutes = attrs["duration_minutes"]
        start_times = attrs["start_times"]

        for st in start_times:
            end_minutes = st.hour * 60 + st.minute + duration_minutes
            if end_minutes > 24 * 60:
                raise serializers.ValidationError(
                    f"Slot bắt đầu {st} với duration {duration_minutes} phút vượt quá 24h"
                )

        for st in start_times:
            end_time = (datetime.combine(date, st) + timedelta(minutes=duration_minutes)).time()
            overlapping = TimeSlot.objects.filter(
                therapist_id=therapist_id,
                date=date,
                start_time__lt=end_time,
                end_time__gt=st,
            ).exists()
            if overlapping:
                raise serializers.ValidationError(f"Slot {st} bị trùng với lịch đã tồn tại")

        return attrs
