'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Stats, Cycle } from '@/lib/types';
import { Award, BookOpen, Calendar, Flame, RefreshCw, PlusCircle, CheckCircle, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cached_stats');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [currentCycle, setCurrentCycle] = useState<Cycle | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cached_current_cycle');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cached_stats');
      return !saved;
    }
    return true;
  });
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
        localStorage.setItem('cached_stats', JSON.stringify(statsData));
      }
      
      if (cycleRes.ok) {
        const cycleData = await cycleRes.json();
        if (cycleData.id) {
          setCurrentCycle(cycleData);
          localStorage.setItem('cached_current_cycle', JSON.stringify(cycleData));
        } else {
          setCurrentCycle(null);
          localStorage.removeItem('cached_current_cycle');
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
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center gap-4 hover:border-primary/30 hover:shadow-primary/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-inner">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Total Words Learned</p>
              <h4 className="text-2xl font-black text-white">{stats.total_words}</h4>
            </div>
          </div>

          {/* Card 2: Completed Cycles */}
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/30 hover:shadow-emerald-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-inner">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Completed Cycles</p>
              <h4 className="text-2xl font-black text-white">{stats.completed_cycles}</h4>
            </div>
          </div>

          {/* Card 3: Streak */}
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center gap-4 hover:border-orange-500/30 hover:shadow-orange-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 shadow-inner">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">Current Streak</p>
              <h4 className="text-2xl font-black text-white">{stats.streak} {stats.streak === 1 ? 'day' : 'days'}</h4>
            </div>
          </div>

          {/* Card 4: Daily Goal */}
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl flex items-center gap-4 hover:border-indigo-500/30 hover:shadow-indigo-500/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 shadow-inner">
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
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between border-l-4 border-l-primary/70 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl" />
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold text-white mb-3">Learning Cycle Engine</h3>
            
            {currentCycle ? (
              <div className="space-y-5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-wider border border-primary/20">
                    Cycle {currentCycle.cycle_number} Active
                  </span>
                  {currentCycle.is_full_review && (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-wider border border-amber-500/20">
                      Full Review Milestone
                    </span>
                  )}
                </div>

                <p className="text-[#94a3b8] leading-relaxed text-sm">
                  {currentCycle.is_full_review
                    ? "This is a full-review cycle. No new words will be added. You must review all previously learned words from cycles 1-6 at least 7 times."
                    : `You are in a regular cycle. Add 20 new words and complete at least 7 review passes of previous words to finalize.`}
                </p>

                {stats && !currentCycle.is_full_review && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-gray-400">
                      <span>Words input today</span>
                      <span className="text-white font-bold">{stats.words_today} / {stats.daily_goal} ({stats.daily_goal_percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#1e293b] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-indigo-500 h-2 rounded-full transition-all duration-500 shadow-md shadow-primary/40"
                        style={{ width: `${Math.min(100, stats.daily_goal_percentage)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6">
                <p className="text-gray-300 leading-relaxed text-sm">
                  You do not have any active learning cycles currently. Start a new cycle to begin inputting words and practicing.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 relative z-10">
            {currentCycle ? (
              <Link
                href={`/cycle/${currentCycle.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
              >
                Go to Active Cycle
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={handleStartCycle}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-6 py-3.5 text-sm font-bold text-white hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
              >
                <PlusCircle className="h-5 w-5" />
                Start Next Learning Cycle
              </button>
            )}
          </div>
        </div>

        {/* Practice Streak Calendar Info Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between bg-gradient-to-br from-[#0f172a] via-[#1e1b4b]/50 to-[#2e1065]/20 border border-white/5 relative overflow-hidden">
          <div className="absolute -bottom-8 -right-8 h-24 w-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-5">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2.5">Streak & Logic Calendar</h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              Learning vocabulary requires consistency. Build a streak by completing your daily cycles. Sequence-based cycles will pause and wait if you take a break, so your path is preserved!
            </p>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 relative z-10">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Goal</span>
              <span className="text-[#f8fafc] font-bold">20 words/day, 7 reviews/cycle</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
