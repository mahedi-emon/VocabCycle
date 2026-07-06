from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Cycle, Vocabulary, Review
from .services import CycleEngine

User = get_user_model()

class LearningCycleEngineTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword123",
            name="Test User"
        )
        self.engine = CycleEngine(self.user)

    def test_start_new_cycle(self):
        # Start the first cycle
        cycle, words_to_review = self.engine.start_new_cycle()
        self.assertEqual(cycle.cycle_number, 1)
        self.assertFalse(cycle.is_full_review)
        self.assertEqual(words_to_review.count(), 0)

        # Try to start another cycle before completing the first
        with self.assertRaises(ValueError):
            self.engine.start_new_cycle()

    def test_add_words_to_cycle(self):
        cycle, _ = self.engine.start_new_cycle()
        
        words_data = [{"word": f"word{i}", "meaning": f"meaning{i}"} for i in range(20)]
        created = self.engine.add_words_to_cycle(cycle, words_data)
        self.assertEqual(len(created), 20)
        self.assertEqual(Vocabulary.objects.filter(user=self.user).count(), 20)

        # Try to add more words than allowed (limit is 20)
        with self.assertRaises(ValueError):
            self.engine.add_words_to_cycle(cycle, [{"word": "extra", "meaning": "extra"}])

    def test_cycle_completion_rules(self):
        cycle, _ = self.engine.start_new_cycle()
        
        # Adding 20 words
        words_data = [{"word": f"word{i}", "meaning": f"meaning{i}"} for i in range(20)]
        self.engine.add_words_to_cycle(cycle, words_data)

        # Try to complete without 7 reviews
        with self.assertRaises(ValueError):
            self.engine.complete_cycle(cycle)

        # Record 7 review passes
        for _ in range(7):
            self.engine.record_review(cycle)

        # Now complete should succeed
        completed_cycle = self.engine.complete_cycle(cycle)
        self.assertTrue(completed_cycle.is_completed)

    def test_full_review_cycle_selection(self):
        # Helper to complete a cycle
        def complete_one_cycle(num):
            c = Cycle.objects.create(user=self.user, cycle_number=num, is_full_review=(num % 7 == 0))
            # Mock reviews
            words_data = [{"word": f"word_{num}_{i}", "meaning": "meaning"} for i in range(20)] if not c.is_full_review else []
            for w in words_data:
                v = Vocabulary.objects.create(user=self.user, word=w["word"], meaning=w["meaning"], introduced_cycle=num)
                Review.objects.create(cycle=c, vocabulary=v, review_count=7)
            c.completed_at = timezone.now()
            c.save()

        # Complete cycles 1 to 6
        for i in range(1, 7):
            complete_one_cycle(i)

        # Start cycle 7 (should be full review)
        cycle, words_to_review = self.engine.start_new_cycle()
        self.assertEqual(cycle.cycle_number, 7)
        self.assertTrue(cycle.is_full_review)
        # Should review all words from cycles 1 to 6 (6 cycles * 20 words = 120 words)
        self.assertEqual(words_to_review.count(), 120)
