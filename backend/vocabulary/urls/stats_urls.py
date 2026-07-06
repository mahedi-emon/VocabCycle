"""Stats URL routes."""

from django.urls import path
from vocabulary.views import StatsView

urlpatterns = [
    path("", StatsView.as_view(), name="stats"),
]
