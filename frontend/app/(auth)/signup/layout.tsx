import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up Free – VocabCycle IELTS, GRE & SAT Vocabulary Builder',
  description:
    'Create a free VocabCycle account to start learning IELTS, GRE, and SAT vocabulary. Learn 20 new English words daily with spaced repetition, track your progress, and build a powerful vocabulary for exam success.',
  openGraph: {
    title: 'Sign Up Free – VocabCycle IELTS & GRE Vocabulary Builder',
    description:
      'Join VocabCycle for free and start mastering IELTS, GRE, and SAT vocabulary with structured daily learning cycles and spaced repetition review.',
    url: 'https://vocabcycle.rawsyst.com/signup',
  },
  alternates: {
    canonical: 'https://vocabcycle.rawsyst.com/signup',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
