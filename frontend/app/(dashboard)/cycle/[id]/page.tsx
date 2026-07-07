'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CycleDetail, Review } from '@/lib/types';
import { CheckCircle, AlertTriangle, ArrowRight, Shuffle, Play, Check, RefreshCw, XCircle } from 'lucide-react';

interface WordInput {
  word: string;
  meaning: string;
  synonyms: string;
  antonyms: string;
}

export default function CycleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const cycleId = params.id as string;

  const [cycle, setCycle] = useState<CycleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Input Wizard States (4 steps * 5 words = 20 words total)
  const [wizardStep, setWizardStep] = useState(0); // 0 to 3
  const [inputs, setInputs] = useState<WordInput[]>(
    Array(20).fill(null).map(() => ({ word: '', meaning: '', synonyms: '', antonyms: '' }))
  );

  // Review Mode States
  const [reviewCountFilter, setReviewCountFilter] = useState<number>(20); // 5/10/15/20
  const [shuffledReviews, setShuffledReviews] = useState<Review[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [userSpellingAttempt, setUserSpellingAttempt] = useState('');
  const [spellingStatus, setSpellingStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const fetchCycleData = async () => {
    try {
      const res = await api.getCycleDetails(cycleId);
      if (res.ok) {
        const data = await res.json();
        setCycle(data);
        setShuffledReviews(data.reviews || []);
      } else {
        setError('Cycle not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve cycle details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cycleId) {
      fetchCycleData();
    }
  }, [cycleId]);

  // Handle Input field change
  const handleInputChange = (index: number, field: keyof WordInput, value: string) => {
    const nextInputs = [...inputs];
    nextInputs[index] = {
      ...nextInputs[index],
      [field]: value,
    };
    setInputs(nextInputs);
  };

  // Submit all 20 words
  const handleSubmitWords = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that all 20 words have at least a Word and a Meaning
    const incompleteIndex = inputs.findIndex(w => !w.word.trim() || !w.meaning.trim());
    if (incompleteIndex !== -1) {
      setError(`Please fill in at least Word and Meaning for all 20 entries (Row ${incompleteIndex + 1} is incomplete).`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.addWords(inputs);
      if (res.ok) {
        // Refresh cycle details to load words into review records
        await fetchCycleData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add words to cycle.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to submit words.');
    } finally {
      setSubmitting(false);
    }
  };

  // Shuffling Reviews
  const handleShuffle = () => {
    if (!cycle) return;
    const items = [...cycle.reviews];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    setShuffledReviews(items);
    setCurrentReviewIndex(0);
    setShowMeaning(false);
    setUserSpellingAttempt('');
    setSpellingStatus('idle');
  };

  // Check user spelling spelling logic
  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    if (shuffledReviews.length === 0) return;
    const currentWord = shuffledReviews[currentReviewIndex].word.trim().toLowerCase();
    const attempt = userSpellingAttempt.trim().toLowerCase();

    if (currentWord === attempt) {
      setSpellingStatus('correct');
    } else {
      setSpellingStatus('incorrect');
    }
    setShowMeaning(true);
  };

  // Move to next word in review queue
  const handleNextReviewWord = () => {
    setShowMeaning(false);
    setUserSpellingAttempt('');
    setSpellingStatus('idle');

    if (currentReviewIndex < Math.min(reviewCountFilter, shuffledReviews.length) - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
    } else {
      // Completed a full review pass of the active set! Let's submit to backend
      handleRecordReviewPass();
    }
  };

  // Record a review round completed
  const handleRecordReviewPass = async () => {
    setSubmitting(true);
    try {
      const res = await api.recordReview();
      if (res.ok) {
        await fetchCycleData();
        setCurrentReviewIndex(0);
        setError(null);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to record review pass.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error recording review.');
    } finally {
      setSubmitting(false);
    }
  };

  // Complete Cycle
  const handleCompleteCycle = async () => {
    setSubmitting(true);
    try {
      const res = await api.completeCycle();
      if (res.ok) {
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to complete cycle.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!cycle) return null;

  // Decide if we are in "Input" state or "Review" state
  const hasAddedWords = cycle.is_full_review || (cycle.reviews && cycle.reviews.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Cycle {cycle.cycle_number}
          </h1>
          <p className="mt-1 text-gray-400">
            {cycle.is_full_review ? 'Full Review Cycle (No new words)' : 'Daily Learning & Review Practice'}
          </p>
        </div>
        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-gray-300 border border-border">
            Status: {cycle.is_completed ? 'Completed' : 'Active'}
          </span>
          {cycle.is_full_review && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400 border border-orange-500/20">
              Full Review Milestone
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* ──────────────────────────────────────────────
          1. INPUT MODE WIZARD (only if words not yet added)
         ────────────────────────────────────────────── */}
      {!hasAddedWords && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Daily Vocabulary Input</h3>
            <span className="text-sm font-medium text-gray-400">
              Step {wizardStep + 1} of 4 (Words {wizardStep * 5 + 1} - {wizardStep * 5 + 5} of 20)
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#1f2937] rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(wizardStep + 1) * 25}%` }}
            />
          </div>

          <form onSubmit={handleSubmitWords} className="space-y-6">
            <div className="space-y-4">
              {Array(5).fill(null).map((_, i) => {
                const index = wizardStep * 5 + i;
                return (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl border border-white/5 bg-[#0f172a]/30 hover:bg-[#0f172a]/50 transition-all items-end">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Word #{index + 1}
                      </label>
                      <input
                        type="text"
                        required
                        value={inputs[index].word}
                        onChange={(e) => handleInputChange(index, 'word', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1e293b]/50 px-3.5 py-2.5 text-white text-sm focus:bg-[#1e293b] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        placeholder="e.g. Ephemeral"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Meaning
                      </label>
                      <input
                        type="text"
                        required
                        value={inputs[index].meaning}
                        onChange={(e) => handleInputChange(index, 'meaning', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1e293b]/50 px-3.5 py-2.5 text-white text-sm focus:bg-[#1e293b] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        placeholder="e.g. Lasting a short time"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Synonyms (opt)
                      </label>
                      <input
                        type="text"
                        value={inputs[index].synonyms}
                        onChange={(e) => handleInputChange(index, 'synonyms', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1e293b]/50 px-3.5 py-2.5 text-white text-sm focus:bg-[#1e293b] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        placeholder="e.g. transient, fleeting"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Antonyms (opt)
                      </label>
                      <input
                        type="text"
                        value={inputs[index].antonyms}
                        onChange={(e) => handleInputChange(index, 'antonyms', e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#1e293b]/50 px-3.5 py-2.5 text-white text-sm focus:bg-[#1e293b] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        placeholder="e.g. permanent"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-6">
              <button
                type="button"
                disabled={wizardStep === 0}
                onClick={() => setWizardStep(wizardStep - 1)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-secondary disabled:opacity-50"
              >
                Previous Step
              </button>

              {wizardStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent flex items-center gap-2"
                >
                  Next Step
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-55"
                >
                  {submitting ? 'Submitting Words...' : 'Submit 20 Words'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          2. REVIEW MODE (only after words have been added/full-review)
         ────────────────────────────────────────────── */}
      {hasAddedWords && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Spaced Repetition Practice Board */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cycle Completed Banner */}
            {cycle.is_completed && (
              <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/30 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Spaced Repetition Completed</h3>
                  <p className="text-sm text-gray-300">You successfully finished all requirements for Cycle {cycle.cycle_number}.</p>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Dashboard
                </button>
              </div>
            )}

            {!cycle.is_completed && (
              <div className="glass-panel p-6 rounded-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-primary/10 rounded-full blur-3xl" />

                <div className="flex items-center justify-between border-b border-border/40 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Active Recall Practice
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShuffle}
                      className="rounded-xl border border-border p-2 text-gray-400 hover:text-white"
                      title="Shuffle words"
                    >
                      <Shuffle className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {shuffledReviews.length > 0 ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Vocabulary Card</span>
                      <span>
                        {currentReviewIndex + 1} of {Math.min(reviewCountFilter, shuffledReviews.length)}
                      </span>
                    </div>

                    {/* Word Display Block */}
                    <div className="py-10 px-6 flex flex-col items-center justify-center border border-white/5 rounded-2xl bg-gradient-to-br from-[#0f172a] to-[#1e293b]/30 shadow-inner text-center relative overflow-hidden">
                      <span className="text-[10px] text-primary uppercase font-bold tracking-widest mb-3 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/15">Meaning to recall</span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center px-6 leading-normal tracking-tight">
                        {shuffledReviews[currentReviewIndex]?.meaning}
                      </h2>
                      {showMeaning && (
                        <div className="mt-8 pt-6 border-t border-white/5 w-full max-w-sm flex flex-col items-center text-center">
                          <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider mb-2">Correct Vocabulary</span>
                          <h3 className="text-3xl font-black text-emerald-400 tracking-tight">
                            {shuffledReviews[currentReviewIndex]?.word}
                          </h3>
                          {shuffledReviews[currentReviewIndex]?.synonyms && (
                            <p className="mt-3 text-sm text-[#94a3b8]">
                              Synonyms: <span className="text-[#f8fafc] font-semibold">{shuffledReviews[currentReviewIndex].synonyms}</span>
                            </p>
                          )}
                          {shuffledReviews[currentReviewIndex]?.antonyms && (
                            <p className="mt-1.5 text-sm text-[#94a3b8]">
                              Antonyms: <span className="text-[#f8fafc] font-semibold">{shuffledReviews[currentReviewIndex].antonyms}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Active Input Attempt */}
                    <form onSubmit={handleCheckSpelling} className="space-y-5">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={userSpellingAttempt}
                          onChange={(e) => setUserSpellingAttempt(e.target.value)}
                          placeholder="Type spelling here to test spelling..."
                          className="flex-1 rounded-xl border border-white/10 bg-[#1e293b]/50 px-4 py-3 text-white placeholder-gray-500 focus:bg-[#1e293b] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-gradient-to-r from-primary to-indigo-600 border border-primary/20 hover:opacity-95 hover:scale-[1.02] px-6 py-3 font-semibold text-white transition-all shadow-md shadow-primary/25 cursor-pointer"
                        >
                          Check
                        </button>
                      </div>

                      <div className="flex justify-between items-center min-h-[2.5rem] gap-4">
                        <div>
                          {spellingStatus === 'correct' && (
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-emerald-400 text-xs font-semibold animate-pulse-slow">
                              <Check className="h-4 w-4" /> Correct Spelling!
                            </div>
                          )}
                          {spellingStatus === 'incorrect' && (
                            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-red-400 text-xs font-semibold">
                              <XCircle className="h-4 w-4" /> Spelling didn't match. Try again!
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          {!showMeaning && (
                            <button
                              type="button"
                              onClick={() => setShowMeaning(true)}
                              className="text-xs font-bold text-primary hover:text-indigo-400 transition-colors uppercase tracking-wider"
                            >
                              Show Answer
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleNextReviewWord}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                          >
                            Next Word
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-6">No words are active in this review cycle.</p>
                )}
              </div>
            )}
          </div>

          {/* Stats, Spaced Repetition Counters & Completion */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-border/40 pb-3">Cycle Progress</h3>

              {/* Review Multiplier / Passes */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Min Reviews Completed</span>
                  <span className="text-white font-black text-lg">
                    {cycle.review_status.min_reviews} / {CycleEngine.MIN_REVIEWS_TO_COMPLETE}
                  </span>
                </div>

                <div className="w-full bg-[#1f2937] rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (cycle.review_status.min_reviews / CycleEngine.MIN_REVIEWS_TO_COMPLETE) * 100)}%` }}
                  />
                </div>

                {!cycle.is_completed && (
                  <p className="text-xs text-gray-400">
                    {cycle.review_status.can_complete
                      ? 'Congratulations! You have completed all 7 review passes. You can finalize this cycle.'
                      : `You need to review all words in this cycle at least ${cycle.review_status.reviews_needed} more times to complete the cycle.`}
                  </p>
                )}
              </div>

              {/* Subset Filter Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Review Filter Subset
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setReviewCountFilter(num);
                        setCurrentReviewIndex(0);
                      }}
                      className={`rounded-lg py-1.5 text-xs font-semibold border ${
                        reviewCountFilter === num
                          ? 'bg-primary text-white border-primary'
                          : 'bg-secondary text-gray-300 border-border hover:bg-muted'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complete Cycle Button Trigger */}
              {!cycle.is_completed && (
                <button
                  onClick={handleCompleteCycle}
                  disabled={!cycle.review_status.can_complete || submitting}
                  className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  Complete Cycle
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Add static class variables since next doesn't load CycleEngine inside compile time
CycleDetailPage.MIN_REVIEWS_TO_COMPLETE = 7;
class CycleEngine {
  static MIN_REVIEWS_TO_COMPLETE = 7;
}
