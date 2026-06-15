import uuid

from django.db import models


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="customer_conversations")
    therapist = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="therapist_conversations")
    therapist_id_attr = models.CharField(max_length=36)
    last_message_preview = models.CharField(max_length=100, default="", blank=True)
    last_message_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "conversations_conversation"
        indexes = [
            models.Index(fields=["customer"], name="conversati_custome_abc123_idx"),
            models.Index(fields=["therapist"], name="conversati_therapi_def456_idx"),
            models.Index(fields=["last_message_at"], name="conversati_last_mes_ghi789_idx"),
        ]
        ordering = ["-last_message_at", "-created_at"]
        unique_together = (("customer", "therapist"),)


class Message(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey("users.User", on_delete=models.CASCADE, related_name="sent_messages")
    sender_type = models.CharField(max_length=20, choices=[("customer", "Customer"), ("therapist", "Therapist")])
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "conversations_message"
        indexes = [
            models.Index(fields=["conversation", "created_at"], name="conversati_convers_xyz123_idx"),
            models.Index(fields=["sender"], name="conversati_sender_i_jkl456_idx"),
        ]
        ordering = ["created_at"]
