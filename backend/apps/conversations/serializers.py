from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message
from apps.users.serializers import UserSummarySerializer

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)
    sender_type = serializers.CharField(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "sender", "sender_type", "content", "is_read", "created_at"]
        read_only_fields = ["id", "created_at", "sender_type"]


class ConversationSerializer(serializers.ModelSerializer):
    customer = UserSummarySerializer(read_only=True)
    therapist = UserSummarySerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "customer",
            "therapist",
            "therapist_id_attr",
            "last_message_preview",
            "last_message_at",
            "messages",
            "unread_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class StartConversationSerializer(serializers.Serializer):
    therapist_id = serializers.UUIDField()

    def validate_therapist_id(self, value):
        if not User.objects.filter(pk=value, role="therapist", is_active=True).exists():
            raise serializers.ValidationError("Kỹ thuật viên không tồn tại hoặc chưa được kích hoạt.")
        return value
