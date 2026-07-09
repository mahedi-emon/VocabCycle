import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password – VocabCycle Vocabulary Builder',
  description:
    'Forgot your VocabCycle password? Enter your email to receive a password reset link and regain access to your IELTS, GRE, and SAT vocabulary learning dashboard.',
  openGraph: {
    title: 'Reset Password – VocabCycle',
    description: 'Reset your VocabCycle account password to continue your vocabulary learning journey.',
    url: 'https://vocabcycle.rawsyst.com/forgot-password',
  },
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://vocabcycle.rawsyst.com/forgot-password',
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
