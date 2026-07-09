import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In to VocabCycle – IELTS & GRE Vocabulary Builder Login',
  description:
    'Log in to your VocabCycle account to continue learning IELTS, GRE, and SAT vocabulary. Access your learning cycles, review queue, and vocabulary progress dashboard.',
  openGraph: {
    title: 'Sign In to VocabCycle – IELTS & GRE Vocabulary Builder',
    description:
      'Log in to continue your IELTS and GRE vocabulary learning journey with VocabCycle. Track your daily progress and spaced repetition cycles.',
    url: 'https://vocabcycle.rawsyst.com/login',
  },
  alternates: {
    canonical: 'https://vocabcycle.rawsyst.com/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
