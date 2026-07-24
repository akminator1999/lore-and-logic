'use server'

import { prisma } from '@/lib/prisma'

export interface SearchResult {
  id: string
  title: string
  type: 'article' | 'game'
  slug: string
}

export async function search(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return []

  const q = `%${query.trim()}%`

  // Search articles
  const articles = await prisma.article.findMany({
    where: {
      is_published: true,
      OR: [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { excerpt: { contains: query.trim(), mode: 'insensitive' } },
      ],
    },
    select: { id: true, title: true, slug: true },
    take: 5,
  })

  // Search game pages
  const games = await prisma.gamePage.findMany({
    where: {
      OR: [
        { title: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
      ],
    },
    select: { id: true, title: true, slug: true },
    take: 5,
  })

  // Merge and format
  const results: SearchResult[] = [
    ...articles.map((a) => ({ id: a.id, title: a.title, type: 'article' as const, slug: a.slug })),
    ...games.map((g) => ({ id: g.id, title: g.title, type: 'game' as const, slug: g.slug })),
  ]

  return results.slice(0, 8) // return top 8 combined
}