"""Custom User model with email-based authentication and role support."""
import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Custom manager for User model using email as username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(email, password, **extra_fields)

    def get_by_natural_key(self, email):
        return self.get(email=email)


class User(AbstractBaseUser, PermissionsMixin):
    """Custom User model with email as username and role-based access."""

    ROLE_CHOICES = [
        ("customer", "Customer"),
        ("therapist", "Therapist"),
        ("admin", "Admin"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    phone = models.CharField(max_length=20, blank=True, default="")
    full_name = models.CharField(max_length=255)
    avatar_url = models.URLField(max_length=500, blank=True, default="")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="customer")
    google_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        db_table = "users_user"
        indexes = [
            models.Index(fields=["email"]),
            models.Index(fields=["google_id"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return self.email

    def get_short_name(self):
        return self.full_name

    @property
    def is_customer(self):
        return self.role == "customer"

    @property
    def is_therapist(self):
        return self.role == "therapist"

    @property
    def is_admin_user(self):
        return self.role == "admin"
