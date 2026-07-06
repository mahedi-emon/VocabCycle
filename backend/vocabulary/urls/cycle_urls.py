"""Cycle URL routes."""

from django.urls import path
from vocabulary.views import (
    CycleCompleteView,
    CycleCurrentView,
    CycleDetailView,
    CycleListView,
    CycleStartView,
    CycleWordsView,
)

urlpatterns = [
    path("", CycleListView.as_view(), name="cycle-list"),
    path("current/", CycleCurrentView.as_view(), name="cycle-current"),
    path("start/", CycleStartView.as_view(), name="cycle-start"),
    path("complete/", CycleCompleteView.as_view(), name="cycle-complete"),
    path("<uuid:pk>/", CycleDetailView.as_view(), name="cycle-detail"),
    path("<uuid:pk>/words/", CycleWordsView.as_view(), name="cycle-words"),
]
