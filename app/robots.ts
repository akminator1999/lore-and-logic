import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard', '/write', '/bookmarks', '/change-password', '/profile/edit'],
    },
    sitemap: 'https://theloreandlogic.com/sitemap.xml',
  }
}