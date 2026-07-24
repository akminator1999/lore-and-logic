import { prisma } from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://theloreandlogic.com'

  // Fetch all published articles
  const articles = await prisma.article.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true, type: true },
    orderBy: { published_at: 'desc' },
  })

  // Map articles to sitemap entries
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/articles/${article.slug}`,
    lastModified: article.updated_at,
    changeFrequency: article.type === 'deep_dive' ? 'monthly' : 'weekly',
    priority: article.type === 'deep_dive' ? 0.8 : 0.6,
  }))

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/deep-dives`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pulse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // Add more static pages if needed (like /login, /signup, etc.)
  ]

  return [...staticPages, ...articleEntries]
}