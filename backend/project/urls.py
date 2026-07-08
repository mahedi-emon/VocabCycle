"""
VocabCycle URL Configuration
Routes all API endpoints under /api/v1/ and Django admin.
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("rawsyst_admin/", admin.site.urls),
    path("api/v1/auth/", include("accounts.urls.auth_urls")),
    path("api/v1/user/", include("accounts.urls.user_urls")),
    path("api/v1/vocab/", include("vocabulary.urls.vocab_urls")),
    path("api/v1/cycles/", include("vocabulary.urls.cycle_urls")),
    path("api/v1/reviews/", include("vocabulary.urls.review_urls")),
    path("api/v1/stats/", include("vocabulary.urls.stats_urls")),
    path("api/v1/search/", include("vocabulary.urls.search_urls")),
    path("api/v1/reminders/", include("reminders.urls")),
]
