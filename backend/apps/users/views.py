"""Authentication views: Google OAuth, token refresh, logout, profile."""
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.common.permissions import IsActiveUser

from .serializers import (
    AdminRegisterSerializer,
    CustomerRegisterSerializer,
    GoogleLoginSerializer,
    LoginSerializer,
    TherapistRegisterSerializer,
    UpdateProfileSerializer,
    UserSerializer,
)

User = get_user_model()


def google_token_error_types():
    """Return Google token verification exception types available in current environment."""
    errors = [ValueError]
    try:
        from google.auth.exceptions import GoogleAuthError
    except ImportError:  # pragma: no cover - phụ thuộc package Google local
        return tuple(errors)
    errors.append(GoogleAuthError)
    return tuple(errors)


class GoogleOAuth:
    """Helper for Google OAuth ID token verification."""

    @staticmethod
    def verify_id_token(id_token: str) -> dict:
        """Verify Google ID token and return user info."""
        import google.auth.transport.requests
        import google.oauth2.id_token

        request = google.auth.transport.requests.Request()
        return google.oauth2.id_token.verify_oauth2_token(
            id_token,
            request,
            audience=settings.GOOGLE_CLIENT_ID,
        )


class CustomTokenRefreshView(TokenRefreshView):
    """Override TokenRefreshView to wrap response in {"data": ...}."""

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK and isinstance(
            response.data, dict
        ):
            response.data = {"data": response.data}
        return response


class GoogleLoginView(APIView):
    """POST /api/v1/auth/google/ — Google OAuth login/register."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token = serializer.validated_data["id_token"]

        try:
            google_data = GoogleOAuth.verify_id_token(id_token)
        except google_token_error_types():
            return Response(
                {"error": {"code": "INVALID_TOKEN", "message": "Google token không hợp lệ"}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_id = google_data["sub"]
        email = google_data.get("email", "")
        name = google_data.get("name", "")
        picture = google_data.get("picture", "")

        # Get or create user
        user, created = User.objects.get_or_create(
            google_id=google_id,
            defaults={
                "email": email,
                "full_name": name,
                "avatar_url": picture,
            },
        )

        # Check if account is suspended
        if not user.is_active:
            return Response(
                {"error": {"code": "ACCOUNT_SUSPENDED", "message": "Tài khoản đã bị tạm khóa"}},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not created:
            user.full_name = name or user.full_name
            user.avatar_url = picture or user.avatar_url
            user.save(update_fields=["full_name", "avatar_url", "updated_at"])

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                }
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    """POST /api/v1/auth/login/ — Đăng nhập bằng email/password."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                }
            },
            status=status.HTTP_200_OK,
        )


class CustomerRegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/customer/ — Đăng ký tài khoản customer."""

    permission_classes = [permissions.AllowAny]
    serializer_class = CustomerRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                }
            },
            status=status.HTTP_201_CREATED,
        )


class TherapistRegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/therapist/ — Đăng ký therapist tối thiểu cho FE."""

    permission_classes = [permissions.AllowAny]
    serializer_class = TherapistRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                }
            },
            status=status.HTTP_201_CREATED,
        )


class AdminRegisterView(generics.CreateAPIView):
    """POST /api/v1/auth/register/admin/ — Đăng ký admin với OTP protection.

    Xóa tất cả admin cũ và tạo admin mới.
    Chỉ cho phép nếu OTP từ env ADMIN_REGISTRATION_OTP khớp.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = AdminRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "data": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                }
            },
            status=status.HTTP_201_CREATED,
        )


class LogoutView(APIView):
    """POST /api/v1/auth/logout/ — Blacklist refresh token."""

    permission_classes = [IsActiveUser]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": {"code": "MISSING_TOKEN", "message": "Refresh token là bắt buộc"}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"data": {"message": "Đăng xuất thành công"}},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {"error": {"code": "INVALID_TOKEN", "message": "Refresh token không hợp lệ"}},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MeView(generics.RetrieveUpdateAPIView):
    """GET/PUT /api/v1/auth/me/ — Current user profile."""

    permission_classes = [IsActiveUser]

    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method == "PUT":
            return UpdateProfileSerializer
        return UserSerializer

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response({"data": serializer.data})

    def put(self, request, *args, **kwargs):
        serializer = UpdateProfileSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"data": UserSerializer(request.user).data})
