import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding GTA 6 pulse article...')

  // 1. Ensure a game page exists for GTA VI (optional but nice)
  const gta6 = await prisma.gamePage.upsert({
    where: { slug: 'gta-6' },
    update: {},
    create: {
      slug: 'gta-6',
      title: 'Grand Theft Auto VI',
      release_year: 2025,
      platform: ['PS5', 'Xbox Series X|S'],
      developer: 'Rockstar Games',
      genra: ['Open World', 'Action-Adventure'],
      era: 'Modern',
      primary_tech_tags: ['RAGE Engine', 'Global Illumination', 'AI Simulation'],
      description: 'The most ambitious open-world game from Rockstar, set in a modern Vice City.',
    },
  })

  // 2. Get the author (you) – find the user by email
  const author = await prisma.user.findUnique({
    where: { email: 'dev@loreandlogic.com' },
  })

  if (!author) throw new Error('User not found – please seed the user first.')

  // 3. Create the Pulse article
  const article = await prisma.article.upsert({
    where: { slug: 'gta-6-release-date' },
    update: {},
    create: {
      slug: 'gta-6-release-date',
      title: 'GTA 6 Release Date Confirmed – What It Means for Players and Devs',
      excerpt: 'Rockstar locks in the date for the most anticipated open-world game. Here’s the pixel and the story.',
      type: 'pulse',
      author_id: author.id,
      is_published: true,
      published_at: new Date(),
      news_hook: 'After years of speculation, Rockstar Games has officially announced that Grand Theft Auto VI will launch on [Date]. The first trailer gave us a glimpse of a vibrant Vice City and dual protagonists. But beyond the hype, what does this mean for gamers and the game development world?',
      source_url: 'https://www.rockstargames.com/newswire',
      gamer_angle: 'The world of Vice City is denser and more reactive than ever. Expect AI-driven NPCs with routines, seamless interiors, and a level of environmental storytelling that blurs the line between scripted missions and emergent chaos. If the leaked footage is any indication, every playthrough will feel unique.',
      dev_angle: 'Rockstar is running a heavily customized version of the RAGE engine, likely with a new global illumination layer and strand-based hair physics. Developers will study its open-world optimization for the next five years—just as they did with GTA V. The release date also shifts the entire industry calendar.',
    },
  })

  console.log(`✅ Pulse article created: ${article.title}`)

  // 4. Optionally link to tags (create tags if they don't exist)
  const tags = await Promise.all([
    prisma.tag.upsert({ where: { slug: 'open-world' }, update: {}, create: { name: 'Open World', slug: 'open-world' } }),
    prisma.tag.upsert({ where: { slug: 'gta' }, update: {}, create: { name: 'GTA', slug: 'gta' } }),
    prisma.tag.upsert({ where: { slug: 'news' }, update: {}, create: { name: 'News', slug: 'news' } }),
  ])

  for (const tag of tags) {
    await prisma.articleTag.upsert({
      where: { article_id_tag_id: { article_id: article.id, tag_id: tag.id } },
      update: {},
      create: { article_id: article.id, tag_id: tag.id },
    })
  }

  // 5. Link to the GTA VI game page
  await prisma.articleGameLink.upsert({
    where: { article_id_game_id: { article_id: article.id, game_id: gta6.id } },
    update: {},
    create: { article_id: article.id, game_id: gta6.id },
  })

  console.log('🎉 GTA 6 pulse seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })