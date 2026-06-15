from django.urls import path
from .views import (
    ConversationListView,
    ConversationDetailView,
    StartConversationView,
    SendMessageView,
    MarkReadView,
)

app_name = "conversations"

urlpatterns = [
    path("", ConversationListView.as_view(), name="list"),
    path("start/<uuid:therapist_id>/", StartConversationView.as_view(), name="start"),
    path("<uuid:pk>/", ConversationDetailView.as_view(), name="detail"),
    path("<uuid:conversation_id>/send/", SendMessageView.as_view(), name="send"),
    path("<uuid:conversation_id>/mark-read/", MarkReadView.as_view(), name="mark-read"),
]
