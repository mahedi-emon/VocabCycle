"""
Vocabulary app – Learning Cycle Engine.

Core business logic for the VocabCycle learning system:
- Cycles are completion-based, not date-based.
- Each regular cycle: 20 new words + review previous cycle's words (7–10 times).
- Every 7th cycle is a full-review cycle (no new words, review all from previous 6).
- Missed days don't skip cycles; user simply resumes the next cycle.

This service handles cycle creation, word assignment, review tracking,
and cycle completion validation.
"""

from django.db import transaction, models
from django.utils import timezone

from .models import Cycle, Review, Vocabulary


class CycleEngine:
    """Manages the learning cycle lifecycle for a user."""

    WORDS_PER_CYCLE = 20
    MIN_REVIEWS_TO_COMPLETE = 7
    FULL_REVIEW_INTERVAL = 7  # Every 7th cycle is a full review

    def __init__(self, user):
        self.user = user

    def get_current_cycle(self):
        """Get the user's current (incomplete) cycle, or None."""
        return (
            Cycle.objects.filter(user=self.user, completed_at__isnull=True)
            .order_by("-cycle_number")
            .first()
        )

    def get_next_cycle_number(self):
        """Determine the next cycle number for this user."""
        last_cycle = (
            Cycle.objects.filter(user=self.user)
            .order_by("-cycle_number")
            .first()
        )
        return (last_cycle.cycle_number + 1) if last_cycle else 1

    def is_full_review_cycle(self, cycle_number):
        """Check if a cycle number is a full-review cycle (multiples of 7)."""
        return cycle_number % self.FULL_REVIEW_INTERVAL == 0

    @transaction.atomic
    def start_new_cycle(self):
        """
        Start a new learning cycle for the user.

        Rules:
        - User must have completed all previous cycles first.
        - Determines if the new cycle is a full-review cycle.
        - For full-review cycles, links all words from the previous 6 cycles for review.
        - For regular cycles, links previous cycle's words for review (if any).

        Returns:
            tuple: (cycle, words_to_review) – the new Cycle instance and
                   queryset of words that need to be reviewed.

        Raises:
            ValueError: If the user has an incomplete cycle.
        """
        current = self.get_current_cycle()
        if current is not None:
            raise ValueError(
                f"You must complete Cycle {current.cycle_number} before starting a new one."
            )

        next_number = self.get_next_cycle_number()
        is_full_review = self.is_full_review_cycle(next_number)

        cycle = Cycle.objects.create(
            user=self.user,
            cycle_number=next_number,
            is_full_review=is_full_review,
        )

        # Set up review records for words that need to be reviewed in this cycle
        if is_full_review:
            # Full review: review all words from the previous 6 cycles
            review_start = max(1, next_number - self.FULL_REVIEW_INTERVAL + 1)
            review_end = next_number - 1
            words_to_review = Vocabulary.objects.filter(
                user=self.user,
                introduced_cycle__gte=review_start,
                introduced_cycle__lte=review_end,
            )
        else:
            # Regular cycle: review words from the immediately previous cycle
            prev_number = next_number - 1
            if prev_number >= 1:
                words_to_review = Vocabulary.objects.filter(
                    user=self.user,
                    introduced_cycle=prev_number,
                )
            else:
                # First cycle ever – no previous words to review
                words_to_review = Vocabulary.objects.none()

        # Create Review records for each word that needs reviewing
        review_objects = [
            Review(cycle=cycle, vocabulary=word) for word in words_to_review
        ]
        Review.objects.bulk_create(review_objects)

        return cycle, words_to_review

    @transaction.atomic
    def add_words_to_cycle(self, cycle, words_data):
        """
        Add new vocabulary words to a cycle.

        Args:
            cycle: The Cycle instance.
            words_data: List of dicts with 'word', 'meaning', 'synonyms', 'antonyms'.

        Returns:
            list: Created Vocabulary instances.

        Raises:
            ValueError: If the cycle is a full-review cycle (no new words allowed)
                        or if too many words are being added.
        """
        if cycle.is_full_review:
            raise ValueError("Cannot add new words to a full-review cycle.")

        if cycle.is_completed:
            raise ValueError("Cannot add words to a completed cycle.")

        # Check how many words already exist in this cycle
        existing_count = Vocabulary.objects.filter(
            user=self.user, introduced_cycle=cycle.cycle_number
        ).count()

        if existing_count + len(words_data) > self.WORDS_PER_CYCLE:
            remaining = self.WORDS_PER_CYCLE - existing_count
            raise ValueError(
                f"Can only add {remaining} more words to this cycle "
                f"({existing_count}/{self.WORDS_PER_CYCLE} already added)."
            )

        vocab_objects = [
            Vocabulary(
                user=self.user,
                word=w["word"],
                meaning=w["meaning"],
                synonyms=w.get("synonyms", ""),
                antonyms=w.get("antonyms", ""),
                introduced_cycle=cycle.cycle_number,
            )
            for w in words_data
        ]
        created = Vocabulary.objects.bulk_create(vocab_objects)

        # Also create Review records for the new words in this cycle
        review_objects = [Review(cycle=cycle, vocabulary=v) for v in created]
        Review.objects.bulk_create(review_objects)

        return created

    @transaction.atomic
    def record_review(self, cycle):
        """
        Record one review pass for all words in a cycle.
        Increments review_count for all Review records in this cycle.

        Returns:
            int: The new minimum review count across all words in the cycle.
        """
        if cycle.is_completed:
            raise ValueError("Cannot review a completed cycle.")

        reviews = Review.objects.filter(cycle=cycle)
        if not reviews.exists():
            raise ValueError("No words to review in this cycle.")

        reviews.update(
            review_count=models.F("review_count") + 1,
            last_reviewed=timezone.now(),
        )

        # Return the minimum review count (determines if cycle can be completed)
        min_count = reviews.order_by("review_count").first()
        # Refresh to get the updated value
        min_count.refresh_from_db()
        return min_count.review_count

    def get_cycle_review_status(self, cycle):
        """
        Get the review status for a cycle.

        Returns:
            dict with 'total_words', 'min_reviews', 'can_complete', 'reviews_needed'.
        """
        reviews = Review.objects.filter(cycle=cycle)
        total = reviews.count()

        if total == 0:
            return {
                "total_words": 0,
                "min_reviews": 0,
                "can_complete": False,
                "reviews_needed": self.MIN_REVIEWS_TO_COMPLETE,
            }

        min_review = reviews.order_by("review_count").first().review_count

        return {
            "total_words": total,
            "min_reviews": min_review,
            "can_complete": min_review >= self.MIN_REVIEWS_TO_COMPLETE,
            "reviews_needed": max(0, self.MIN_REVIEWS_TO_COMPLETE - min_review),
        }

    @transaction.atomic
    def complete_cycle(self, cycle):
        """
        Mark a cycle as complete.

        Validates that all words have been reviewed at least MIN_REVIEWS_TO_COMPLETE times.
        For non-full-review cycles, also checks that WORDS_PER_CYCLE words were added.

        Raises:
            ValueError: If completion criteria are not met.
        """
        if cycle.is_completed:
            raise ValueError("This cycle is already completed.")

        status = self.get_cycle_review_status(cycle)

        if not cycle.is_full_review:
            word_count = Vocabulary.objects.filter(
                user=self.user, introduced_cycle=cycle.cycle_number
            ).count()
            if word_count < self.WORDS_PER_CYCLE:
                raise ValueError(
                    f"You need to add {self.WORDS_PER_CYCLE - word_count} more "
                    f"words before completing this cycle."
                )

        if not status["can_complete"]:
            raise ValueError(
                f"You need {status['reviews_needed']} more review pass(es) "
                f"to complete this cycle."
            )

        cycle.completed_at = timezone.now()
        cycle.save()

        return cycle

    def get_streak(self):
        """
        Calculate the user's current streak.
        A streak counts consecutive days where at least one cycle was active
        (started or completed).

        Returns:
            int: Current streak in days.
        """
        today = timezone.now().date()
        streak = 0
        current_date = today

        while True:
            # Check if user had any cycle activity on this date
            had_activity = Cycle.objects.filter(
                user=self.user,
                started_at__date__lte=current_date,
            ).filter(
                models.Q(completed_at__date__gte=current_date)
                | models.Q(completed_at__isnull=True, started_at__date=current_date)
            ).exists()

            # Also check if any review was done on this date
            if not had_activity:
                had_activity = Review.objects.filter(
                    cycle__user=self.user,
                    last_reviewed__date=current_date,
                ).exists()

            if had_activity:
                streak += 1
                current_date = current_date - timezone.timedelta(days=1)
            else:
                break

        return streak

    def get_stats(self):
        """
        Get aggregated statistics for the user.

        Returns:
            dict with total_words, completed_cycles, current_cycle, streak,
            words_today, daily_goal_percentage.
        """
        total_words = Vocabulary.objects.filter(user=self.user).count()
        completed_cycles = Cycle.objects.filter(
            user=self.user, completed_at__isnull=False
        ).count()

        current_cycle = self.get_current_cycle()
        current_cycle_number = current_cycle.cycle_number if current_cycle else 0

        words_today = 0
        daily_goal_pct = 0
        if current_cycle and not current_cycle.is_full_review:
            words_today = Vocabulary.objects.filter(
                user=self.user,
                introduced_cycle=current_cycle.cycle_number,
            ).count()
            daily_goal_pct = round((words_today / self.WORDS_PER_CYCLE) * 100)

        streak = self.get_streak()

        return {
            "total_words": total_words,
            "completed_cycles": completed_cycles,
            "current_cycle_number": current_cycle_number,
            "current_cycle_id": str(current_cycle.id) if current_cycle else None,
            "is_full_review": current_cycle.is_full_review if current_cycle else False,
            "streak": streak,
            "words_today": words_today,
            "daily_goal": self.WORDS_PER_CYCLE,
            "daily_goal_percentage": daily_goal_pct,
        }
