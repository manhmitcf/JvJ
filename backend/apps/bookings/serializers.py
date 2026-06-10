"""Booking serializers."""
from rest_framework import serializers

from apps.timeslots.models import TimeSlot
from apps.treatments.models import Treatment

from .models import Booking


class BookingDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    therapist_name = serializers.SerializerMethodField()
    treatment_name = serializers.SerializerMethodField()
    treatment_price = serializers.SerializerMethodField()
    slot_date = serializers.SerializerMethodField()
    slot_start_time = serializers.SerializerMethodField()
    slot_end_time = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "id", "code", "customer", "customer_name",
            "therapist", "therapist_name", "treatment", "treatment_name",
            "treatment_price", "timeslot", "slot_date", "slot_start_time",
            "slot_end_time", "address", "contact_phone", "total_amount",
            "status", "payment_status", "note", "rejection_reason",
            "confirmed_at", "completed_at", "cancelled_at", "created_at",
        ]
        read_only_fields = [
            "id", "code", "status", "payment_status",
            "confirmed_at", "completed_at", "cancelled_at", "created_at",
        ]

    def get_customer_name(self, obj):
        return obj.customer.full_name

    def get_therapist_name(self, obj):
        return obj.therapist.full_name

    def get_treatment_name(self, obj):
        return obj.treatment.name

    def get_treatment_price(self, obj):
        return obj.treatment.price

    def get_slot_date(self, obj):
        return obj.timeslot.date

    def get_slot_start_time(self, obj):
        return obj.timeslot.start_time

    def get_slot_end_time(self, obj):
        return obj.timeslot.end_time


class BookingCreateSerializer(serializers.ModelSerializer):
    timeslot_id = serializers.UUIDField()
    treatment_id = serializers.UUIDField()
    therapist_id = serializers.UUIDField()

    class Meta:
        model = Booking
        fields = [
            "timeslot_id", "treatment_id", "therapist_id",
            "address", "contact_phone", "note",
        ]

    def validate_timeslot_id(self, value):
        try:
            TimeSlot.objects.get(id=value, status="available")
        except TimeSlot.DoesNotExist:
            raise serializers.ValidationError("Timeslot không khả dụng hoặc không tồn tại")
        return value

    def validate(self, attrs):
        from apps.treatments.models import Treatment

        try:
            treatment = Treatment.objects.get(id=attrs["treatment_id"])
        except Treatment.DoesNotExist:
            raise serializers.ValidationError("Liệu trình không tồn tại")

        if treatment.therapist_id != attrs["therapist_id"]:
            raise serializers.ValidationError("Liệu trình không thuộc therapist này")
        return attrs

    def create(self, validated_data):
        from django.db import IntegrityError, transaction

        timeslot_id = validated_data.pop("timeslot_id")
        treatment_id = validated_data.pop("treatment_id")
        therapist_id = validated_data.pop("therapist_id")

        for attempt in range(5):
            try:
                with transaction.atomic():
                    timeslot = TimeSlot.objects.select_for_update().get(id=timeslot_id)
                    treatment = Treatment.objects.get(id=treatment_id)
                    therapist = treatment.therapist
                    customer = self.context["request"].user

                    booking = Booking.objects.create_booking(
                        customer=customer,
                        therapist=therapist,
                        treatment=treatment,
                        timeslot=timeslot,
                        address=validated_data["address"],
                        contact_phone=validated_data["contact_phone"],
                        total_amount=treatment.price,
                        note=validated_data.get("note", ""),
                    )
                    return booking
            except IntegrityError:
                # Code collision - retry with new code
                if attempt < 4:
                    continue
                raise


class BookingActionSerializer(serializers.Serializer):
    """Serializer cho action endpoints (cancel, confirm, etc)."""
    reason = serializers.CharField(required=False, allow_blank=True, default="")
