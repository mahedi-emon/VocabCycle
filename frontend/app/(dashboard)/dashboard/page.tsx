'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Stats, Cycle } from '@/lib/types';
import { Award, BookOpen, Calendar, Flame, RefreshCw, PlusCircle, CheckCircle, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, cycleRes] = await Promise.all([
        api.getStats(),
        api.getCurrentCycle(),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (cycleRes.ok) {
        const cycleData = await cycleRes.json();
        if (cycleData.id) {
          setCurrentCycle(cycleData);
        } else {
          setCurrentCycle(null);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartCycle = async () => {
    setLoading(true);
    try {
      const res = await api.startCycle();
      if (res.ok) {
        await fetchDashboardData();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to start a new cycle.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
        <p className="mt-1 text-gray-400">Track your daily progress and manage vocabulary learning cycles.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Words Learned */}
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Words Learned</p>
              <h4 className="text-2xl font-black text-white">{stats.total_words}</h4>
            </div>
          </div>

          {/* Card 2: Completed Cycles */}
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Completed Cycles</p>
              <h4 className="text-2xl font-black text-white">{stats.completed_cycles}</h4>
            </div>
          </div>

          {/* Card 3: Streak */}
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <Flame className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Current Streak</p>
              <h4 className="text-2xl font-black text-white">{stats.streak} {stats.streak === 1 ? 'day' : 'days'}</h4>
            </div>
          </div>

          {/* Card 4: Daily Goal */}
          <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Today's Words Progress</p>
              <h4 className="text-2xl font-black text-white">{stats.words_today} / {stats.daily_goal}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Engine Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Status & Action */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Learning Cycle Engine</h3>
            
            {currentCycle ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/20 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    Cycle {currentCycle.cycle_number} Active
                  </div>
                  {currentCycle.is_full_review && (
                    <div className="rounded-full bg-orange-500/20 text-orange-400 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                      Full Review
                    </div>
                  )}
                </div>

                <p className="text-gray-300">
                  {currentCycle.is_full_review
                    ? "This is a full-review cycle. No new words will be added. You must review all previously learned words from cycles 1-6 at least 7 times."
                    : `You are in a regular cycle. Add 20 new words and complete at least 7 review passes of previous words to finalize.`}
                </p>

                {stats && !currentCycle.is_full_review && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Words input today</span>
                      <span>{stats.words_today} / {stats.daily_goal} ({stats.daily_goal_percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#1f2937] rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, stats.daily_goal_percentage)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6">
                <p className="text-gray-300 mb-4">
                  You do not have any active learning cycles currently. Start a new cycle to begin inputting words and practicing.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            {currentCycle ? (
              <Link
                href={`/cycle/${currentCycle.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-accent transition-all shadow-md shadow-primary/20"
              >
                Go to Active Cycle
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={handleStartCycle}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-accent transition-all shadow-md shadow-primary/20"
              >
                <PlusCircle className="h-5 w-5" />
                Start Next Learning Cycle
              </button>
            )}
          </div>
        </div>

        {/* Spaced Repetition Spurt Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-[#111827] to-[#1e1b4b]">
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Practice Streak Calendar</h3>
            <p className="text-sm text-gray-400">
              Learning vocabulary requires consistency. Build a streak by completing your daily cycles. Sequence-based cycles will pause and wait if you take a break, so your path is preserved!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Goal</span>
              <span className="text-white font-semibold">20 words/day, 7 reviews/cycle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
