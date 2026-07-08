'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, 
  GraduationCap, 
  RefreshCw, 
  Calendar, 
  ArrowRight, 
  Zap, 
  Trophy, 
  ShieldCheck,
  Mail,
  Linkedin,
  Github,
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f3f4f6] flex flex-col">
      {/* Navbar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-white">
            Vocab<span className="text-primary">Cycle</span>
          </span>
        </div>
        <div>
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent transition-all shadow-md shadow-primary/20"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white text-sm font-semibold px-4 py-2.5"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent transition-all shadow-md shadow-primary/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col items-center text-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wide mb-6">
          <Zap className="h-3 w-3 animate-pulse" />
          Sequence-Based Vocabulary Acquisition
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl">
          Learn. Review. <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Remember.</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl">
          VocabCycle helps you master English vocabulary for <span className="text-white font-semibold">IELTS, GRE, and SAT</span>. Lock in 20 new words a day using sequence-based learning cycles that adapt when you miss a day.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-accent transition-all shadow-lg shadow-primary/20"
          >
            Start Your First Cycle
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <section className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          <div className="glass-panel p-6 rounded-2xl text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">20 New Words Daily</h3>
            <p className="text-sm text-gray-400">
              Input 20 words each day with meanings, synonyms, and antonyms using our distraction-free, 4x5 grid layout.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <RefreshCw className="h-6 w-6 animate-spin-slow" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Completion-Based Spaced Repetition</h3>
            <p className="text-sm text-gray-400">
              Review words at least 7 times to finish a cycle. Missed days never break your learning sequence — pick up exactly where you left off.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Full Review Milestones</h3>
            <p className="text-sm text-gray-400">
              Every 7th cycle switches to a "Full Review" mode. Re-consolidate all words learned in the previous 6 cycles to lock them into long-term memory.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-[#0b0f19]/80 backdrop-blur-md py-12 relative overflow-hidden mt-20">
        {/* Glow Element */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-border/60 pb-10">
            {/* Column 1: App Info */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold tracking-tight text-white">
                  Vocab<span className="text-primary">Cycle</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 max-w-sm mt-2">
                VocabCycle is a structured daily learning engine that makes retention effortless. Form the habit of review, hit your milestones, and build your vocabulary.
              </p>
              <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                Secure & Production-Ready SaaS Application
              </div>
            </div>

            {/* Column 2: Developer & Profiles */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Owner & Developer</h4>
              <p className="text-sm text-gray-400">
                Created, Designed & Owned by{' '}
                <a 
                  href="https://www.mahedihasanemon.site/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:text-accent font-semibold transition-all hover:underline"
                >
                  Mahedi Hasan Emon
                </a>
              </p>
              
              <div className="flex gap-4 mt-3">
                <a 
                  href="https://github.com/mahedi-emon" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary hover:bg-primary/20 text-gray-400 hover:text-white border border-border hover:border-primary/30 transition-all"
                  title="GitHub Profile"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/in/mahediemon/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary hover:bg-primary/20 text-gray-400 hover:text-white border border-border hover:border-primary/30 transition-all"
                  title="LinkedIn Profile"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a 
                  href="https://www.mahedihasanemon.site/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center h-10 w-10 rounded-xl bg-secondary hover:bg-primary/20 text-gray-400 hover:text-white border border-border hover:border-primary/30 transition-all"
                  title="Portfolio Website"
                >
                  <Globe className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Column 3: Contact & Company */}
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Get in Touch</h4>
              <p className="text-sm text-gray-400">
                A project of his company{' '}
                <a 
                  href="https://www.rawsyst.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:text-accent font-semibold transition-all hover:underline"
                >
                  RawSyst IT
                </a>
              </p>

              <div className="flex flex-col gap-2.5 mt-2">
                <a 
                  href="mailto:mahedi.emon62@gmail.com" 
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors w-fit"
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>mahedi.emon62@gmail.com</span>
                </a>
                <a 
                  href="mailto:rawsystit@gmail.com" 
                  className="flex items-center gap-2.5 text-sm text-gray-400 hover:text-white transition-colors w-fit"
                >
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span>rawsystit@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()}{' '}
              <a 
                href="https://www.mahedihasanemon.site/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline text-gray-400 hover:text-white transition-colors"
              >
                Mahedi Hasan Emon
              </a>
              {' '}•{' '}
              <a 
                href="https://www.rawsyst.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:underline text-gray-400 hover:text-white transition-colors"
              >
                RawSyst IT
              </a>
              . All Rights Reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
