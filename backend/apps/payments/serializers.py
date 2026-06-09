"""Payment serializers."""
from rest_framework import serializers

from .models import Payment, PaymentTimeline


class PaymentTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTimeline
        fields = ["id", "label", "tone", "occurred_at"]


class PaymentSerializer(serializers.ModelSerializer):
    timeline = PaymentTimelineSerializer(many=True, read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id", "booking", "method", "amount", "status",
            "vnpay_transaction_id", "created_at", "completed_at", "timeline",
        ]
        read_only_fields = [
            "id", "status", "vnpay_transaction_id", "created_at", "completed_at",
        ]
