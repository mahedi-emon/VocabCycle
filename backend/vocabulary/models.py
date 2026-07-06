"""
Vocabulary app – Models for Vocabulary, Cycle, and Review.
"""

import uuid
from django.conf import settings
from django.db import models


class Vocabulary(models.Model):
    """A vocabulary word belonging to a user, introduced in a specific cycle."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vocabularies",
    )
    word = models.CharField(max_length=255)
    meaning = models.TextField()
    synonyms = models.TextField(blank=True, default="")
    antonyms = models.TextField(blank=True, default="")
    introduced_cycle = models.PositiveIntegerField(
        help_text="The cycle number in which this word was first introduced."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vocabularies"
        ordering = ["-created_at"]
        verbose_name_plural = "vocabularies"

    def __str__(self):
        return f"{self.word} (Cycle {self.introduced_cycle})"


class Cycle(models.Model):
    """
    A learning cycle for a user.
    Regular cycles introduce 20 new words + review previous cycle.
    Full-review cycles (multiples of 7) review all words from the previous 6 cycles.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cycles",
    )
    cycle_number = models.PositiveIntegerField()
    is_full_review = models.BooleanField(
        default=False,
        help_text="True if this is a full-review cycle (multiples of 7).",
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "cycles"
        ordering = ["-cycle_number"]
        unique_together = ["user", "cycle_number"]

    @property
    def is_completed(self):
        return self.completed_at is not None

    def __str__(self):
        status = "✓" if self.is_completed else "…"
        review = " [Full Review]" if self.is_full_review else ""
        return f"Cycle {self.cycle_number}{review} {status}"


class Review(models.Model):
    """
    Tracks how many times a vocabulary word has been reviewed in a specific cycle.
    A word needs ≥7 reviews in a cycle for that cycle to be completable.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cycle = models.ForeignKey(
        Cycle,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    vocabulary = models.ForeignKey(
        Vocabulary,
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    review_count = models.PositiveIntegerField(default=0)
    last_reviewed = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "reviews"
        unique_together = ["cycle", "vocabulary"]

    def __str__(self):
        return f"{self.vocabulary.word} in Cycle {self.cycle.cycle_number}: {self.review_count} reviews"
