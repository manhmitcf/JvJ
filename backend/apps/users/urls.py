"""URL routes for authentication endpoints."""
from django.urls import path

from .views import (
    AdminRegisterView,
    CustomTokenRefreshView,
    CustomerRegisterView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    MeView,
    TherapistRegisterView,
)

urlpatterns = [
    path("google/", GoogleLoginView.as_view(), name="auth-google"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("register/customer/", CustomerRegisterView.as_view(), name="auth-register-customer"),
    path("register/therapist/", TherapistRegisterView.as_view(), name="auth-register-therapist"),
    path("register/admin/", AdminRegisterView.as_view(), name="auth-register-admin"),
    path("refresh/", CustomTokenRefreshView.as_view(), name="auth-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", MeView.as_view(), name="auth-me"),
]
