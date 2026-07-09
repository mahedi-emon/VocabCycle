import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = 'https://vocabcycle.rawsyst.com';
const siteName = 'VocabCycle';

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  // ── Core Metadata ────────────────────────────────────────
  metadataBase: new URL(siteUrl),
  title: {
    default: 'VocabCycle – IELTS, GRE & SAT Vocabulary Builder | Learn 20 Words Daily',
    template: '%s | VocabCycle',
  },
  description:
    'Master IELTS, GRE, and SAT vocabulary with structured daily learning cycles. Learn 20 new English words every day using spaced repetition, smart review queues, and completion-based cycles. Free vocabulary builder for IELTS preparation, GRE word list, and SAT vocab practice.',
  applicationName: siteName,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: 'Mahedi Hasan Emon',
  publisher: 'RawSyst IT',

  // ── Exhaustive Keyword Targeting ─────────────────────────
  keywords: [
    // Primary IELTS keywords
    'IELTS vocabulary',
    'IELTS vocabulary builder',
    'IELTS word list',
    'IELTS vocabulary practice',
    'IELTS vocabulary app',
    'IELTS vocabulary online',
    'IELTS academic vocabulary',
    'IELTS general vocabulary',
    'IELTS band 7 vocabulary',
    'IELTS band 8 vocabulary',
    'IELTS band 9 vocabulary',
    'IELTS preparation vocabulary',
    'IELTS exam vocabulary',
    'IELTS reading vocabulary',
    'IELTS writing vocabulary',
    'IELTS speaking vocabulary',
    'IELTS listening vocabulary',
    'IELTS vocabulary with meanings',
    'IELTS vocabulary with synonyms',
    'IELTS vocabulary with antonyms',
    'best IELTS vocabulary app',
    'free IELTS vocabulary app',
    'IELTS vocabulary practice online',
    'IELTS word list 2025',
    'IELTS word list 2026',
    'IELTS essential words',
    'IELTS academic word list',
    'IELTS vocabulary for beginners',

    // GRE keywords
    'GRE vocabulary',
    'GRE vocabulary builder',
    'GRE word list',
    'GRE vocabulary app',
    'GRE vocabulary practice',
    'GRE high frequency words',
    'GRE barrons word list',
    'GRE essential words',
    'GRE verbal vocabulary',
    'GRE vocab flashcards',
    'GRE vocabulary online',
    'best GRE vocabulary app',
    'free GRE vocabulary app',

    // SAT keywords
    'SAT vocabulary',
    'SAT vocabulary builder',
    'SAT word list',
    'SAT vocabulary app',
    'SAT vocabulary practice',
    'SAT high frequency words',
    'SAT essential words',
    'SAT vocab flashcards',
    'SAT vocabulary online',

    // General vocabulary & English learning
    'vocabulary builder',
    'vocabulary builder app',
    'vocabulary builder online',
    'learn English vocabulary',
    'English vocabulary app',
    'English word list',
    'English vocabulary builder',
    'daily vocabulary practice',
    'learn new words daily',
    'learn 20 words a day',
    'vocabulary learning app',
    'vocabulary memorization',
    'vocabulary flashcards',
    'vocabulary quiz',
    'English words with meanings',
    'English words with synonyms',
    'English words with antonyms',
    'advanced English vocabulary',
    'academic English vocabulary',
    'improve English vocabulary',
    'build vocabulary fast',
    'vocabulary improvement',
    'vocabulary app for students',
    'vocabulary practice online free',

    // Spaced repetition & learning method keywords
    'spaced repetition vocabulary',
    'spaced repetition app',
    'vocabulary spaced repetition',
    'cycle based learning',
    'sequence based vocabulary learning',
    'structured vocabulary learning',
    'daily word learning app',
    'vocabulary review system',
    'smart vocabulary review',
    'vocabulary retention',
    'long term vocabulary memory',
    'vocabulary memorization technique',

    // Exam preparation keywords
    'exam vocabulary builder',
    'test prep vocabulary',
    'English proficiency vocabulary',
    'English test preparation',
    'TOEFL vocabulary',
    'TOEFL vocabulary builder',
    'PTE vocabulary',
    'PTE vocabulary builder',
    'Duolingo English Test vocabulary',

    // Bengali/Bangla audience keywords
    'IELTS vocabulary bangla',
    'IELTS vocabulary বাংলা',
    'IELTS preparation bangladesh',
    'vocabulary builder bangla',
    'ইংরেজি শব্দ শেখা',
    'আইইএলটিএস ভোকাবুলারি',
    'ভোকাবুলারি বিল্ডার',
    'প্রতিদিন ইংরেজি শব্দ শেখা',
    'GRE vocabulary bangla',

    // VocabCycle brand keywords
    'VocabCycle',
    'VocabCycle app',
    'vocab cycle',
    'vocabcycle.rawsyst.com',
  ],

  // ── Category & Classification ────────────────────────────
  category: 'Education',

  // ── Open Graph (Facebook, LinkedIn, WhatsApp) ────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['bn_BD'],
    url: siteUrl,
    siteName: siteName,
    title: 'VocabCycle – IELTS, GRE & SAT Vocabulary Builder | Learn 20 Words Daily',
    description:
      'Master IELTS, GRE, and SAT vocabulary with structured daily learning cycles. Learn 20 new English words every day using spaced repetition and smart review queues. Free online vocabulary builder.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'VocabCycle – Learn, Review, Remember Vocabulary for IELTS, GRE & SAT',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter Card ─────────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    title: 'VocabCycle – IELTS, GRE & SAT Vocabulary Builder',
    description:
      'Learn 20 new English words daily with structured learning cycles and spaced repetition. Free vocabulary builder for IELTS, GRE, and SAT preparation.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@mahediemon',
  },

  // ── Alternates & Canonical ───────────────────────────────
  alternates: {
    canonical: siteUrl,
  },

  // ── Robots ───────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Verification ─────────────────────────────────────────
  verification: {
    google: 'N480l5UrICbsN-eWFXF4R2qb0YLf3iiZec9dx6ITwbY',
  },

  // ── Other Meta Tags ──────────────────────────────────────
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'VocabCycle',
    'format-detection': 'telephone=no',
    'msapplication-TileColor': '#6366f1',
    'msapplication-config': 'none',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#0b0f19] text-[#f3f4f6]`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
