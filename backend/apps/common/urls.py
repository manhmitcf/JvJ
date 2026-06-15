"""Common app URLs."""
from django.urls import path

from .views import FileUploadView, MultiFileUploadView

urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="file-upload"),
    path("upload/multiple/", MultiFileUploadView.as_view(), name="file-upload-multiple"),
]
