"""Vocabulary URL routes."""

from django.urls import path
from vocabulary.views import VocabularyListView, VocabularyExportView

urlpatterns = [
    path("", VocabularyListView.as_view(), name="vocab-list-create"),
    path("export/", VocabularyExportView.as_view(), name="vocab-export"),
]
