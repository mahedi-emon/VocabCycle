"""Review URL routes."""

from django.urls import path
from vocabulary.views import RecordReviewView

urlpatterns = [
    path("", RecordReviewView.as_view(), name="review-record"),
]
