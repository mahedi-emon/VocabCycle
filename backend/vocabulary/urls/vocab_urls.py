"""Vocabulary URL routes."""

from django.urls import path
from vocabulary.views import VocabularyListView

urlpatterns = [
    path("", VocabularyListView.as_view(), name="vocab-list-create"),
]
