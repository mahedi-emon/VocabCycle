"""
Vocabulary app – Views for vocabulary, cycles, reviews, stats, and search.
"""

from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Cycle, Review, Vocabulary
from .serializers import (
    BulkVocabularyCreateSerializer,
    CycleDetailSerializer,
    CycleListSerializer,
    StatsSerializer,
    VocabularySerializer,
)
from .services import CycleEngine


# ──────────────────────────────────────────────
# Vocabulary Views
# ──────────────────────────────────────────────


class VocabularyListView(generics.ListAPIView):
    """
    GET /api/v1/vocab/ – List all of the current user's vocabulary words.
    POST /api/v1/vocab/ – Bulk create words for the current cycle.
    """

    serializer_class = VocabularySerializer

    def get_queryset(self):
        return Vocabulary.objects.filter(user=self.request.user)

    def post(self, request):
        serializer = BulkVocabularyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = CycleEngine(request.user)
        current_cycle = engine.get_current_cycle()

        if current_cycle is None:
            return Response(
                {"error": "No active cycle. Start a new cycle first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            created = engine.add_words_to_cycle(
                current_cycle, serializer.validated_data["words"]
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": f"{len(created)} words added to Cycle {current_cycle.cycle_number}.",
                "words": VocabularySerializer(created, many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )



# ──────────────────────────────────────────────
# Cycle Views
# ──────────────────────────────────────────────


class CycleListView(generics.ListAPIView):
    """GET /api/v1/cycles/ – List all of the user's cycles."""

    serializer_class = CycleListSerializer

    def get_queryset(self):
        return Cycle.objects.filter(user=self.request.user)


class CycleCurrentView(APIView):
    """GET /api/v1/cycles/current/ – Get the current (active) cycle."""

    def get(self, request):
        engine = CycleEngine(request.user)
        cycle = engine.get_current_cycle()

        if cycle is None:
            return Response(
                {
                    "message": "No active cycle.",
                    "next_cycle_number": engine.get_next_cycle_number(),
                    "next_is_full_review": engine.is_full_review_cycle(
                        engine.get_next_cycle_number()
                    ),
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            CycleDetailSerializer(cycle).data,
            status=status.HTTP_200_OK,
        )


class CycleStartView(APIView):
    """POST /api/v1/cycles/start/ – Start a new learning cycle."""

    def post(self, request):
        engine = CycleEngine(request.user)
        try:
            cycle, words_to_review = engine.start_new_cycle()
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": f"Cycle {cycle.cycle_number} started."
                + (" (Full Review)" if cycle.is_full_review else ""),
                "cycle": CycleDetailSerializer(cycle).data,
                "words_to_review_count": words_to_review.count(),
            },
            status=status.HTTP_201_CREATED,
        )


class CycleCompleteView(APIView):
    """POST /api/v1/cycles/complete/ – Mark the current cycle as complete."""

    def post(self, request):
        engine = CycleEngine(request.user)
        current_cycle = engine.get_current_cycle()

        if current_cycle is None:
            return Response(
                {"error": "No active cycle to complete."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            cycle = engine.complete_cycle(current_cycle)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": f"Cycle {cycle.cycle_number} completed!",
                "cycle": CycleListSerializer(cycle).data,
            },
            status=status.HTTP_200_OK,
        )


class CycleDetailView(generics.RetrieveAPIView):
    """GET /api/v1/cycles/{id}/ – Get details for a specific cycle."""

    serializer_class = CycleDetailSerializer

    def get_queryset(self):
        return Cycle.objects.filter(user=self.request.user)


class CycleWordsView(APIView):
    """GET /api/v1/cycles/{id}/words/ – Get all words associated with a cycle."""

    def get(self, request, pk):
        try:
            cycle = Cycle.objects.get(pk=pk, user=request.user)
        except Cycle.DoesNotExist:
            return Response(
                {"error": "Cycle not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        reviews = Review.objects.filter(cycle=cycle).select_related("vocabulary")
        words_data = []
        for review in reviews:
            words_data.append(
                {
                    "id": str(review.vocabulary.id),
                    "word": review.vocabulary.word,
                    "meaning": review.vocabulary.meaning,
                    "synonyms": review.vocabulary.synonyms,
                    "antonyms": review.vocabulary.antonyms,
                    "review_count": review.review_count,
                    "introduced_cycle": review.vocabulary.introduced_cycle,
                }
            )

        return Response(words_data, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# Review Views
# ──────────────────────────────────────────────


class RecordReviewView(APIView):
    """POST /api/v1/reviews/ – Record one review pass for the current cycle."""

    def post(self, request):
        engine = CycleEngine(request.user)
        current_cycle = engine.get_current_cycle()

        if current_cycle is None:
            return Response(
                {"error": "No active cycle to review."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            min_count = engine.record_review(current_cycle)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        review_status = engine.get_cycle_review_status(current_cycle)

        return Response(
            {
                "message": f"Review recorded. Minimum reviews: {min_count}.",
                "review_status": review_status,
            },
            status=status.HTTP_200_OK,
        )


# ──────────────────────────────────────────────
# Stats View
# ──────────────────────────────────────────────


class StatsView(APIView):
    """GET /api/v1/stats/ – Get aggregated statistics for the current user."""

    def get(self, request):
        engine = CycleEngine(request.user)
        stats = engine.get_stats()
        serializer = StatsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────
# Search View
# ──────────────────────────────────────────────


class SearchView(APIView):
    """GET /api/v1/search/?word=... – Search user's vocabulary by word or meaning."""

    def get(self, request):
        query = request.query_params.get("word", "").strip()
        if not query:
            return Response(
                {"error": "Provide a 'word' query parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        results = Vocabulary.objects.filter(
            user=request.user
        ).filter(
            Q(word__icontains=query)
            | Q(meaning__icontains=query)
            | Q(synonyms__icontains=query)
        )

        serializer = VocabularySerializer(results[:50], many=True)
        return Response(
            {"query": query, "count": results.count(), "results": serializer.data},
            status=status.HTTP_200_OK,
        )
