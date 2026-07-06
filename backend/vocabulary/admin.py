"""Vocabulary app – Django Admin registration."""

from django.contrib import admin
from .models import Cycle, Review, Vocabulary


@admin.register(Vocabulary)
class VocabularyAdmin(admin.ModelAdmin):
    list_display = ["word", "meaning", "user", "introduced_cycle", "created_at"]
    list_filter = ["introduced_cycle", "created_at"]
    search_fields = ["word", "meaning", "synonyms"]
    ordering = ["-created_at"]


@admin.register(Cycle)
class CycleAdmin(admin.ModelAdmin):
    list_display = [
        "cycle_number",
        "user",
        "is_full_review",
        "started_at",
        "completed_at",
    ]
    list_filter = ["is_full_review", "completed_at"]
    ordering = ["-cycle_number"]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["vocabulary", "cycle", "review_count", "last_reviewed"]
    list_filter = ["review_count"]
    ordering = ["-last_reviewed"]
