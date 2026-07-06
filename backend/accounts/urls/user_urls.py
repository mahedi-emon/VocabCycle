"""User profile and settings URL routes."""

from django.urls import path

from accounts.views import ChangePasswordView, UserProfileView, UserSettingsView

urlpatterns = [
    path("", UserProfileView.as_view(), name="user-profile"),
    path("settings/", UserSettingsView.as_view(), name="user-settings"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
