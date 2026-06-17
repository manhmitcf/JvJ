"""URL routes for Notifications app."""
from django.urls import path

from . import views

urlpatterns = [
    path("", views.NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", views.UnreadCountView.as_view(), name="notification-unread-count"),
    path("<uuid:id>/read/", views.MarkAsReadView.as_view(), name="notification-mark-read"),
    path("mark-all-read/", views.MarkAllReadView.as_view(), name="notification-mark-all-read"),
    path("create/", views.NotificationCreateView.as_view(), name="notification-create"),
]
