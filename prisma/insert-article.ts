import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"

dotenv.config()

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

//Change only the data below to insert a new article
async function main() {
    const articleData = {
        slug: '', //unique slug for the article
        title: '',
        excerpt: '',
        type: '' as const, // 'deep-dive' / 'pulse'
        authorEmail: '',    // email of the existing user(author)
        is_published: true,
        published_at: new Date(),
        difficulty: '' as const, //curious_gamer | aspiring_dev | seasoned_pro
        cover_image_url: '', //optional

        //Deepdive specific fields
        intro_gamer: '',
        intro_dev: '',
        pixel_section: ``,

        story_section: '',
        connecting_thread: '',
        open_question: '',

        //Pulse specific fields
        news_hook: '',
        source_url: '',
        gamer_angle: ` `,
        dev_angle: '',

        // Tags - array of tag names (must already exist in the table)
        tagNames: ['', ''],

        // GamePage linking (optional) - slug of the existing game page
        gameSlug: '',
    }

    //No Changes Needed below this line

    //1. Find the author by email
    const author = await prisma.user.findUnique({
        where: { email: articleData.authorEmail},
        select: { id: true },
    })
    if (!author) throw new Error('Author not found')

    //2. Create the article
    const article = await prisma.article.create({
        data: {
            slug: articleData.slug,
            title: articleData.title,
            excerpt: articleData.excerpt,
            type: articleData.type,
            author_id: author.id,
            is_published: articleData.is_published,
            published_at: articleData.published_at,
            difficulty: articleData.difficulty,
            cover_image_url: articleData.cover_image_url,
            intro_gamer: articleData.intro_gamer,
            intro_dev: articleData.intro_dev,
            pixel_section: articleData.pixel_section,
            story_section: articleData.story_section,
            connecting_thread: articleData.connecting_thread,
            open_question: articleData.open_question,
            news_hook: articleData.news_hook,
            source_url: articleData.source_url,
            gamer_angle: articleData.gamer_angle,
            dev_angle: articleData.dev_angle,
        },
    })

    //3. Connect tags
    for (const tagName of articleData.tagNames) {
        const tag = await prisma.tag.findUnique({
            where: { name: tagName },
        })
        if(tag) {
            await prisma.articleTag.create({
                data: { article_id: article.id, tag_id: tag.id },
            })
        } else {
            console.warn(`Tag "${tagName}"not found,
                skipped.`)
        }
    }

    // 4. Connect to a GamePage if provided
  if (articleData.gameSlug) {
    const game = await prisma.gamePage.findUnique({
      where: { slug: articleData.gameSlug },
    })
    if (game) {
      await prisma.articleGameLink.create({
        data: { article_id: article.id, game_id: game.id },
      })
    } else {
      console.warn(`⚠️  GamePage "${articleData.gameSlug}" not found – skipped.`)
    }
  }

  console.log(`✅ Article created: ${article.title}`)
  console.log(`   URL: /articles/${article.slug}`)
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })