from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, StartConversationSerializer


User = get_user_model()


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(customer=user) | Q(therapist=user)).order_by("-last_message_at", "-created_at")


class ConversationDetailView(generics.RetrieveAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Conversation.objects.filter(Q(customer=user) | Q(therapist=user))


class StartConversationView(generics.GenericAPIView):
    serializer_class = StartConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, therapist_id, *args, **kwargs):
        serializer = self.get_serializer(data={"therapist_id": therapist_id})
        serializer.is_valid(raise_exception=True)

        customer = request.user
        conversation, _ = Conversation.objects.get_or_create(
            customer=customer,
            therapist_id=serializer.validated_data["therapist_id"],
        )
        response_serializer = ConversationSerializer(conversation, context={"request": request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation = generics.get_object_or_404(
            Conversation.objects.filter(Q(customer=self.request.user) | Q(therapist=self.request.user)),
            pk=self.kwargs["conversation_id"],
        )
        serializer.save(sender=self.request.user, conversation=conversation, sender_type=self.request.user.role)


class MarkReadView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        conversation = generics.get_object_or_404(
            Conversation.objects.filter(Q(customer=request.user) | Q(therapist=request.user)),
            pk=kwargs["conversation_id"],
        )
        Message.objects.filter(conversation=conversation, is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({"marked_read": 0}, status=status.HTTP_200_OK)
