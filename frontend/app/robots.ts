import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/cycle/',
          '/history/',
          '/stats/',
          '/profile/',
          '/settings/',
          '/forgot-password',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://vocabcycle.rawsyst.com/sitemap.xml',
  };
}
