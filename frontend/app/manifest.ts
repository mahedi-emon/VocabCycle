import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VocabCycle – IELTS, GRE & SAT Vocabulary Builder',
    short_name: 'VocabCycle',
    description:
      'Master IELTS, GRE, and SAT vocabulary with structured daily learning cycles, spaced repetition, and smart review queues. Learn 20 new English words every day.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#6366f1',
    orientation: 'portrait',
    categories: ['education', 'productivity'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: '64x64 32x32 16x16',
        type: 'image/x-icon',
      },
    ],
  };
}
