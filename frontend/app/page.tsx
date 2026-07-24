'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Footer } from '@/components/layout/Footer';
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
  Globe
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'VocabCycle',
        url: 'https://vocabcycle.rawsyst.com',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web Browser',
        description:
          'Master IELTS, GRE, and SAT vocabulary with structured daily learning cycles. Learn 20 new English words every day using spaced repetition and smart review queues.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        featureList: [
          'Learn 20 new vocabulary words daily',
          'Spaced repetition review system',
          'IELTS vocabulary preparation',
          'GRE vocabulary builder',
          'SAT vocabulary practice',
          'Completion-based learning cycles',
          'Full review milestones every 7th cycle',
          'Daily email study reminders',
          'Track learning progress and statistics',
          'Synonyms and antonyms for every word',
        ],
        screenshot: 'https://vocabcycle.rawsyst.com/og-image.png',
        author: {
          '@type': 'Person',
          name: 'Mahedi Hasan Emon',
          url: 'https://www.mahedihasanemon.site/',
        },
        creator: {
          '@type': 'Organization',
          name: 'RawSyst IT',
          url: 'https://www.rawsyst.com/',
        },

      },
      {
        '@type': 'Organization',
        name: 'RawSyst IT',
        url: 'https://www.rawsyst.com/',
        logo: 'https://vocabcycle.rawsyst.com/favicon.ico',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'rawsystit@gmail.com',
          contactType: 'customer service',
        },
        founder: {
          '@type': 'Person',
          name: 'Mahedi Hasan Emon',
          url: 'https://www.mahedihasanemon.site/',
        },
      },
      {
        '@type': 'WebSite',
        name: 'VocabCycle',
        url: 'https://vocabcycle.rawsyst.com',
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'What is VocabCycle?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'VocabCycle is a free online vocabulary builder designed for IELTS, GRE, and SAT preparation. It uses structured daily learning cycles where you learn 20 new English words per day with meanings, synonyms, and antonyms, then review them using spaced repetition to lock words into long-term memory.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does VocabCycle help with IELTS vocabulary preparation?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'VocabCycle helps IELTS candidates build a strong academic vocabulary by learning 20 words daily. Each learning cycle requires reviewing words at least 7 times, ensuring deep retention. This structured approach is ideal for achieving IELTS band 7, 8, or 9 scores in reading, writing, speaking, and listening.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is VocabCycle free to use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, VocabCycle is completely free. You can sign up with email or Google, start learning vocabulary immediately, and track your progress with detailed statistics — all at no cost.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does the spaced repetition system work in VocabCycle?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'VocabCycle uses completion-based spaced repetition. You must review each set of 20 words at least 7 times to complete a cycle. Every 7th cycle is a Full Review milestone where you re-consolidate all words from the previous 6 cycles. Missed days never break your sequence — you pick up exactly where you left off.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I use VocabCycle for GRE and SAT preparation?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Absolutely. VocabCycle supports vocabulary building for IELTS, GRE, SAT, TOEFL, PTE, and any English proficiency test. You input your own target words with meanings, synonyms, and antonyms, making it flexible for any exam word list.',
            },
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#f3f4f6] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          Free IELTS, GRE & SAT Vocabulary Builder
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
          Master IELTS Vocabulary.{' '}
          <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            Learn. Review. Remember.
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl">
          VocabCycle is a <strong className="text-white">free vocabulary builder</strong> for{' '}
          <strong className="text-white">IELTS, GRE, and SAT preparation</strong>. Learn{' '}
          <strong className="text-white">20 new English words daily</strong> with meanings,
          synonyms, and antonyms using structured{' '}
          <strong className="text-white">spaced repetition</strong> learning cycles.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-accent transition-all shadow-lg shadow-primary/20"
          >
            Start Learning Vocabulary Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <section className="mt-24 w-full" aria-label="Key Features">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-12">
            Why Students Choose VocabCycle for{' '}
            <span className="text-primary">IELTS & GRE Vocabulary</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <article className="glass-panel p-6 rounded-2xl text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Learn 20 New Words Daily</h3>
              <p className="text-sm text-gray-400">
                Build your IELTS and GRE vocabulary by inputting 20 words each day with meanings, synonyms, and antonyms using our distraction-free 4×5 grid layout.
              </p>
            </article>

            <article className="glass-panel p-6 rounded-2xl text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <RefreshCw className="h-6 w-6 animate-spin-slow" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Spaced Repetition Review System</h3>
              <p className="text-sm text-gray-400">
                Review vocabulary words at least 7 times to finish a cycle. Missed days never break your learning sequence — pick up exactly where you left off.
              </p>
            </article>

            <article className="glass-panel p-6 rounded-2xl text-left">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Full Review Milestones</h3>
              <p className="text-sm text-gray-400">
                Every 7th cycle switches to a &quot;Full Review&quot; mode. Re-consolidate all words learned in the previous 6 cycles to lock them into long-term memory.
              </p>
            </article>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mt-24 w-full" aria-label="How VocabCycle Works">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-12">
            How VocabCycle Works —{' '}
            <span className="text-primary">3 Simple Steps</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <article className="glass-panel p-6 rounded-2xl text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary mb-5 text-2xl font-extrabold border border-primary/20">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Add Your Word List</h3>
              <p className="text-sm text-gray-400">
                Enter 20 IELTS, GRE, SAT, or any English vocabulary words with their meanings, synonyms, and antonyms to start a new learning cycle.
              </p>
            </article>

            <article className="glass-panel p-6 rounded-2xl text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary mb-5 text-2xl font-extrabold border border-primary/20">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Review Daily with Spaced Repetition</h3>
              <p className="text-sm text-gray-400">
                Review your vocabulary words each day. VocabCycle tracks your progress and ensures you review each word set at least 7 times for maximum retention.
              </p>
            </article>

            <article className="glass-panel p-6 rounded-2xl text-center">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/10 text-primary mb-5 text-2xl font-extrabold border border-primary/20">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Achieve Long-Term Memory</h3>
              <p className="text-sm text-gray-400">
                Complete cycles and hit Full Review milestones to permanently lock vocabulary into long-term memory — perfect for IELTS band 7+ and GRE high scores.
              </p>
            </article>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="mt-24 w-full max-w-5xl" aria-label="About VocabCycle">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-4">
              <Globe className="h-3 w-3" />
              Why VocabCycle?
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
              The Best Free Vocabulary Builder for{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-primary to-indigo-400 bg-clip-text text-transparent">
                IELTS, GRE &amp; SAT
              </span>
            </h2>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="relative group rounded-2xl border border-border bg-[#111827]/60 p-6 hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Built for Exam Success</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  <strong className="text-gray-300">VocabCycle</strong> is a powerful, free online vocabulary builder designed for students preparing for <strong className="text-gray-300">IELTS, GRE, SAT, TOEFL,</strong> and <strong className="text-gray-300">PTE</strong> exams. Build academic vocabulary for IELTS band 7, 8, or 9, master GRE high-frequency words, or prepare SAT flashcards — all with a structured, science-backed approach.
                </p>
              </div>
            </div>

            <div className="relative group rounded-2xl border border-border bg-[#111827]/60 p-6 hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Smart Learning Cycles</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Unlike apps that rely on random flashcards, VocabCycle uses a unique <strong className="text-gray-300">sequence-based learning cycle system</strong> with <strong className="text-gray-300">spaced repetition</strong>. Learn exactly 20 new words daily — complete with meanings, synonyms, and antonyms — then systematically review them until each word is locked into long-term memory.
                </p>
              </div>
            </div>

            <div className="relative group rounded-2xl border border-border bg-[#111827]/60 p-6 hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Never Lose Progress</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Our completion-based approach means <strong className="text-gray-300">missed days never break your progress</strong>. VocabCycle remembers exactly where you left off. Every 7th cycle triggers a comprehensive Full Review milestone, re-consolidating all words from the previous 6 cycles for maximum retention.
                </p>
              </div>
            </div>

            <div className="relative group rounded-2xl border border-border bg-[#111827]/60 p-6 hover:border-primary/40 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">Stay Consistent</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  VocabCycle includes <strong className="text-gray-300">daily email study reminders</strong>, detailed <strong className="text-gray-300">vocabulary learning statistics</strong>, streak tracking, and a clean dark-mode interface optimized for distraction-free study sessions. Sign up free and start building vocabulary for your English proficiency exams.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-500 px-8 py-4 text-base font-semibold text-white hover:from-accent hover:to-indigo-400 transition-all shadow-lg shadow-primary/20"
            >
              Start Your Vocabulary Journey — It&apos;s Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
