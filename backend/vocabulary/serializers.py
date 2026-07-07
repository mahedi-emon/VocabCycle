"""
Vocabulary app – Serializers for Vocabulary, Cycle, and Review.
"""

from rest_framework import serializers
from .models import Cycle, Review, Vocabulary


class VocabularySerializer(serializers.ModelSerializer):
    """Serializer for a single vocabulary word."""

    class Meta:
        model = Vocabulary
        fields = [
            "id",
            "word",
            "meaning",
            "synonyms",
            "antonyms",
            "introduced_cycle",
            "created_at",
        ]
        read_only_fields = ["id", "introduced_cycle", "created_at"]


class VocabularyInputSerializer(serializers.Serializer):
    """Serializer for a single word input (used in bulk create)."""

    word = serializers.CharField(max_length=255)
    meaning = serializers.CharField()
    synonyms = serializers.CharField(required=False, default="", allow_blank=True)
    antonyms = serializers.CharField(required=False, default="", allow_blank=True)


class BulkVocabularyCreateSerializer(serializers.Serializer):
    """Serializer for bulk creating words (up to 20 per cycle)."""

    words = VocabularyInputSerializer(many=True)

    def validate_words(self, value):
        if not value:
            raise serializers.ValidationError("At least one word is required.")
        if len(value) > 20:
            raise serializers.ValidationError("Cannot add more than 20 words at once.")

        # Check for duplicate words in the batch
        word_texts = [w["word"].strip().lower() for w in value]
        if len(word_texts) != len(set(word_texts)):
            raise serializers.ValidationError("Duplicate words found in the batch.")

        # Ensure every word has a meaning
        for w in value:
            if not w.get("meaning", "").strip():
                raise serializers.ValidationError(
                    f"Meaning is required for word: {w.get('word', '')}"
                )
        return value


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for review records."""

    word = serializers.CharField(source="vocabulary.word", read_only=True)
    meaning = serializers.CharField(source="vocabulary.meaning", read_only=True)
    synonyms = serializers.CharField(source="vocabulary.synonyms", read_only=True)
    antonyms = serializers.CharField(source="vocabulary.antonyms", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "word",
            "meaning",
            "synonyms",
            "antonyms",
            "review_count",
            "last_reviewed",
        ]
        read_only_fields = [
            "id",
            "word",
            "meaning",
            "synonyms",
            "antonyms",
            "review_count",
            "last_reviewed",
        ]



class CycleListSerializer(serializers.ModelSerializer):
    """Serializer for listing cycles (summary view)."""

    is_completed = serializers.BooleanField(read_only=True)
    word_count = serializers.SerializerMethodField()

    class Meta:
        model = Cycle
        fields = [
            "id",
            "cycle_number",
            "is_full_review",
            "is_completed",
            "started_at",
            "completed_at",
            "word_count",
        ]

    def get_word_count(self, obj):
        return obj.reviews.count()


class CycleDetailSerializer(serializers.ModelSerializer):
    """Serializer for cycle detail view with words and review status."""

    is_completed = serializers.BooleanField(read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    review_status = serializers.SerializerMethodField()

    class Meta:
        model = Cycle
        fields = [
            "id",
            "cycle_number",
            "is_full_review",
            "is_completed",
            "started_at",
            "completed_at",
            "reviews",
            "review_status",
        ]

    def get_review_status(self, obj):
        from .services import CycleEngine

        engine = CycleEngine(obj.user)
        return engine.get_cycle_review_status(obj)


class StatsSerializer(serializers.Serializer):
    """Serializer for user statistics."""

    total_words = serializers.IntegerField()
    completed_cycles = serializers.IntegerField()
    current_cycle_number = serializers.IntegerField()
    current_cycle_id = serializers.CharField(allow_null=True)
    is_full_review = serializers.BooleanField()
    streak = serializers.IntegerField()
    words_today = serializers.IntegerField()
    daily_goal = serializers.IntegerField()
    daily_goal_percentage = serializers.IntegerField()
