"""Auth URL routes."""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import GoogleAuthView, LoginView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
]
