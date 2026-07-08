"""Auth URL routes."""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    GoogleAuthView,
    LoginView,
    RegisterView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
