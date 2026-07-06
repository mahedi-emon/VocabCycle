'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Cycle } from '@/lib/types';
import { BookOpen, Calendar, CheckCircle, ChevronRight, History, PlayCircle, HelpCircle } from 'lucide-react';

export default function HistoryPage() {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCycles = async () => {
    try {
      const res = await api.getCycles();
      if (res.ok) {
        const data = await res.json();
        // Sort cycles descending
        setCycles(data.results || data);
      } else {
        setError('Failed to fetch learning history.');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve past cycles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <History className="h-8 w-8 text-primary" />
          Learning History
        </h1>
        <p className="mt-1 text-gray-400">View your learning history, completed cycles, and practice logs.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* History table list */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {cycles.length > 0 ? (
          <div className="divide-y divide-border/40">
            {cycles.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    item.is_completed
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Cycle {item.cycle_number}
                      {item.is_full_review && (
                        <span className="rounded bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-400 border border-orange-500/20">
                          Full Review
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Started {new Date(item.started_at).toLocaleDateString()}
                      {item.completed_at && ` • Completed ${new Date(item.completed_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">
                      {item.word_count} {item.word_count === 1 ? 'word' : 'words'}
                    </span>
                    <span className="block text-xs text-gray-400">
                      {item.is_completed ? 'Consolidated' : 'In Progress'}
                    </span>
                  </div>

                  <Link
                    href={`/cycle/${item.id}`}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                      item.is_completed
                        ? 'border-border text-gray-300 hover:bg-secondary hover:text-white'
                        : 'border-primary bg-primary text-white hover:bg-accent'
                    }`}
                  >
                    {item.is_completed ? 'Re-practice' : 'Continue'}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No cycles found</h3>
            <p className="text-sm text-gray-400 mb-4">You haven't started any vocabulary cycles yet.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent transition-all"
            >
              Start Your First Cycle
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
