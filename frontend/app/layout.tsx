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
    'Master IELTS, GRE, and SAT vocabulary with structured daily learning cycles. Learn 20 new English words every day using spaced repetition, smart review queues, and completion-based cycles. Free vocabulary builder for exam preparation.',
  applicationName: siteName,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  creator: 'Mahedi Hasan Emon',
  publisher: 'RawSyst IT',


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
