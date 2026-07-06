"""Search URL routes."""

from django.urls import path
from vocabulary.views import SearchView

urlpatterns = [
    path("", SearchView.as_view(), name="search"),
]
