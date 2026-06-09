"""Generic file upload endpoint."""
import uuid
from pathlib import Path

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework import permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView


class FileUploadView(APIView):
    """POST /api/v1/upload/ — Upload một file đơn lẻ."""

    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"error": {"code": 400, "message": "Không tìm thấy file"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file size (max 5MB)
        if uploaded_file.size > 5 * 1024 * 1024:
            return Response(
                {"error": {"code": 400, "message": "File quá lớn (tối đa 5MB)"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/webp"]
        if uploaded_file.content_type not in allowed_types:
            return Response(
                {
                    "error": {
                        "code": 400,
                        "message": "Chỉ chấp nhận file ảnh (JPG, PNG, WebP)",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate unique filename
        ext = Path(uploaded_file.name).suffix
        filename = f"uploads/{uuid.uuid4()}{ext}"

        # Save file
        saved_path = default_storage.save(filename, uploaded_file)

        # Return absolute URL using MEDIA_URL
        if saved_path.startswith("/"):
            # Already absolute path from storage backend
            url = request.build_absolute_uri(saved_path)
        else:
            # Relative path, prepend MEDIA_URL
            url = request.build_absolute_uri(f"{settings.MEDIA_URL}{saved_path}")

        return Response({"data": {"url": url}}, status=status.HTTP_201_CREATED)
