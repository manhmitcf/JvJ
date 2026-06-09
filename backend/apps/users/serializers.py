"""Serializers for user authentication and profile management."""
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class GoogleLoginSerializer(serializers.Serializer):
    """Serializer cho Google OAuth login request."""

    id_token = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Google ID token từ frontend",
    )
    credential = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Google credential token từ Google Identity Services",
    )

    def validate(self, attrs):
        token = attrs.get("id_token") or attrs.get("credential")
        if not token:
            raise serializers.ValidationError(
                {"id_token": "Google token là bắt buộc"}
            )
        attrs["id_token"] = token
        return attrs


class CustomerRegisterSerializer(serializers.ModelSerializer):
    """Serializer cho đăng ký customer bằng email/password."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "full_name", "phone"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(
            password=password,
            role="customer",
            **validated_data,
        )


class UserSerializer(serializers.ModelSerializer):
    """Serializer cho User profile — dùng trong auth/me responses."""

    status = serializers.SerializerMethodField()
    years_of_experience = serializers.SerializerMethodField()
    specialties = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    completed_bookings = serializers.SerializerMethodField()
    certificate_urls = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "full_name",
            "avatar_url",
            "role",
            "status",
            "years_of_experience",
            "specialties",
            "rating",
            "completed_bookings",
            "certificate_urls",
        ]
        read_only_fields = [
            "id",
            "email",
            "role",
            "status",
            "years_of_experience",
            "specialties",
            "rating",
            "completed_bookings",
            "certificate_urls",
        ]

    def _get_therapist_profile(self, obj):
        return getattr(obj, "therapist_profile", None)

    def get_status(self, obj):
        profile = self._get_therapist_profile(obj)
        return profile.status if profile else None

    def get_years_of_experience(self, obj):
        profile = self._get_therapist_profile(obj)
        return profile.years_of_experience if profile else None

    def get_specialties(self, obj):
        profile = self._get_therapist_profile(obj)
        return profile.specialties if profile else []

    def get_rating(self, obj):
        profile = self._get_therapist_profile(obj)
        if not profile:
            return None
        return float(profile.rating)

    def get_completed_bookings(self, obj):
        profile = self._get_therapist_profile(obj)
        return profile.completed_bookings if profile else None

    def get_certificate_urls(self, obj):
        profile = self._get_therapist_profile(obj)
        return profile.certificate_urls if profile else []

    def update(self, instance, validated_data):
        """Update user profile — role và email không được đổi."""
        validated_data.pop("role", None)
        validated_data.pop("email", None)
        return super().update(instance, validated_data)


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Serializer để cập nhật profile user — chỉ full_name, phone, avatar_url."""

    class Meta:
        model = User
        fields = ["full_name", "phone", "avatar_url"]


class LoginSerializer(serializers.Serializer):
    """Serializer cho email/password login — xác thực user và trả về JWT tokens."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        from django.contrib.auth import authenticate

        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email và mật khẩu là bắt buộc")

        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError("Email hoặc mật khẩu không đúng")

        if not user.is_active:
            raise serializers.ValidationError("Tài khoản đã bị vô hiệu hoá")

        attrs["user"] = user
        return attrs


class TherapistRegisterSerializer(serializers.Serializer):
    """Serializer nhận payload therapist register từ FE nếu cần bridge sang apply flow."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    years_of_experience = serializers.IntegerField(min_value=0)
    specialties = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
    )
    certificate_urls = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        default=list,
    )
    bio = serializers.CharField(required=False, allow_blank=True)

    # Fields mới cho CCCD và thông tin phục vụ
    citizen_id = serializers.CharField(max_length=12)
    service_areas = serializers.ListField(
        child=serializers.CharField(),
        min_length=1,
    )
    has_transport = serializers.BooleanField()
    has_equipment = serializers.BooleanField()

    # File URLs từ upload endpoint
    portrait_url = serializers.URLField()
    citizen_id_front_url = serializers.URLField()
    citizen_id_back_url = serializers.URLField()

    def validate_specialties(self, value):
        if not value:
            raise serializers.ValidationError("Phải chọn ít nhất một chuyên môn")
        return value

    def validate_service_areas(self, value):
        if not value:
            raise serializers.ValidationError("Phải chọn ít nhất một khu vực phục vụ")
        return value

    def validate_citizen_id(self, value):
        if not value.isdigit() or len(value) != 12:
            raise serializers.ValidationError("CCCD phải có đúng 12 chữ số")
        return value

    def create(self, validated_data):
        from apps.therapists.models import TherapistProfile

        password = validated_data.pop("password")
        years_of_experience = validated_data.pop("years_of_experience")
        specialties = validated_data.pop("specialties")
        certificate_urls = validated_data.pop("certificate_urls", [])
        bio = validated_data.pop("bio", "")

        # Extract new fields
        citizen_id = validated_data.pop("citizen_id")
        service_areas = validated_data.pop("service_areas")
        has_transport = validated_data.pop("has_transport")
        has_equipment = validated_data.pop("has_equipment")
        portrait_url = validated_data.pop("portrait_url")
        citizen_id_front_url = validated_data.pop("citizen_id_front_url")
        citizen_id_back_url = validated_data.pop("citizen_id_back_url")

        user = User.objects.create_user(
            password=password,
            role="therapist",
            **validated_data,
        )
        TherapistProfile.objects.create(
            user=user,
            status="pending_approval",
            years_of_experience=years_of_experience,
            specialties=specialties,
            certificate_urls=certificate_urls,
            bio=bio,
            citizen_id=citizen_id,
            service_areas=service_areas,
            has_transport=has_transport,
            has_equipment=has_equipment,
            portrait_url=portrait_url,
            citizen_id_front_url=citizen_id_front_url,
            citizen_id_back_url=citizen_id_back_url,
        )
        return user


class AdminRegisterSerializer(serializers.Serializer):
    """Serializer cho đăng ký admin với OTP protection."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=255)
    otp = serializers.CharField(write_only=True, help_text="OTP từ ADMIN_REGISTRATION_OTP env")

    def validate_otp(self, value):
        from django.conf import settings

        expected_otp = settings.ADMIN_REGISTRATION_OTP
        if not expected_otp:
            raise serializers.ValidationError("OTP chưa được cấu hình trên server")

        if value != expected_otp:
            raise serializers.ValidationError("OTP không đúng")

        return value

    def create(self, validated_data):
        validated_data.pop("otp")
        password = validated_data.pop("password")

        # Xóa tất cả admin cũ
        User.objects.filter(role="admin").delete()

        # Tạo admin mới
        user = User.objects.create_user(
            password=password,
            role="admin",
            is_staff=True,
            is_superuser=True,
            **validated_data,
        )
        return user
