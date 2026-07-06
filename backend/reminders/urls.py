"""Reminder URL routes."""

from django.urls import path
from .views import SendRemindersView

urlpatterns = [
    path("send/", SendRemindersView.as_view(), name="send-reminders"),
]
