"""Vocabulary URL routes."""

from django.urls import path
from vocabulary.views import VocabularyBulkCreateView, VocabularyListView

urlpatterns = [
    path("", VocabularyListView.as_view(), name="vocab-list"),
    path("create/", VocabularyBulkCreateView.as_view(), name="vocab-bulk-create"),
]
