'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Stats, Vocabulary } from '@/lib/types';
import { BarChart3, Search, BookOpen, Flame, Award, HelpCircle } from 'lucide-react';

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Vocabulary[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getStats();
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setError('Failed to fetch statistics.');
        }
      } catch (err) {
        console.error(err);
        setError('Could not retrieve statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await api.search(searchQuery);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Analytics & Search
        </h1>
        <p className="mt-1 text-gray-400">Search your dictionary database and check learning analytics.</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Stats Summary Panel */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-400">Total vocabulary stored</span>
            <div className="flex items-baseline gap-2 mt-4">
              <h2 className="text-4xl font-black text-white">{stats.total_words}</h2>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">words</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Active vocabulary items registered across all cycles.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-400">Spaced repetition streak</span>
            <div className="flex items-baseline gap-2 mt-4">
              <h2 className="text-4xl font-black text-white">{stats.streak}</h2>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">consecutive days</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Daily practices recorded consecutively without interruption.</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <span className="text-sm font-semibold text-gray-400">Cycles finalized</span>
            <div className="flex items-baseline gap-2 mt-4">
              <h2 className="text-4xl font-black text-white">{stats.completed_cycles}</h2>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">cycles</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Milestone cycles completed and successfully consolidated.</p>
          </div>
        </div>
      )}

      {/* Global Dictionary Search Box */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Global Dictionary Lookup
        </h3>

        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by word, meaning, or synonyms..."
            className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={searching}
            className="rounded-xl bg-primary hover:bg-accent px-6 py-3 font-semibold text-white transition-colors"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults.length > 0 ? (
          <div className="space-y-4 pt-4 border-t border-border/40">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Search Results ({searchResults.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border border-border bg-secondary/20 flex flex-col justify-between">
                  <div>
                    <h5 className="text-lg font-black text-primary">{item.word}</h5>
                    <p className="text-sm text-gray-300 mt-1">{item.meaning}</p>
                    {item.synonyms && (
                      <p className="text-xs text-gray-400 mt-2">
                        Synonyms: <span className="text-gray-300">{item.synonyms}</span>
                      </p>
                    )}
                    {item.antonyms && (
                      <p className="text-xs text-gray-400 mt-1">
                        Antonyms: <span className="text-gray-300">{item.antonyms}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-bold uppercase mt-3 self-end">
                    Introduced in Cycle {item.introduced_cycle}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery && !searching ? (
          <div className="p-8 text-center pt-4 border-t border-border/40">
            <HelpCircle className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No matching words found in your vocabulary base.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
