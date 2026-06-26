import { PrismaClient, Prisma } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  //start here - The data for seeding begins here
  const user = await prisma.user.upsert({
    where: {email : 'dev@loreandlogic.com'},
    update: {},
    create: {
        username : 'AKMinator',
        email: 'dev@loreandlogic.com',
        role: 'developer',
        badge: 'Creator',
        favorite_genres: ['FPS', 'RPG'],
        games_worked_on: [],
    },
  })  
  console.log(`✅ User created: ${user.username}`)
  
  //2. Create Tags
  const tags = await Promise.all([
    prisma.tag.upsert({
        where: {slug: '16-bit-era'},
        update: {},
        create: { name: '16-bit Era', slug: '16-bit-era'},  
    }),
    prisma.tag.upsert({
        where: {slug: 'fps'},
        update: {},
        create: { name: 'FPS', slug: 'fps'},
    }),
    prisma.tag.upsert({
        where: {slug: 'bsp'},
        update: {},
        create: { name: 'BSP', slug: 'bsp'},
    }),
    prisma.tag.upsert({
        where: {slug: 'id-tech'},
        update: {},
        create: { name: 'id Tech', slug: 'id-tech'},
    }),
  ])
  console.log(`✅ Tags created: ${tags.map(t => t.name).join(', ')}`)

  //3. Create a game page for DOOM
  const doom = await prisma.gamePage.upsert({
    where: {slug: 'doom-1993'},
    update: {},
    create: {
        slug: 'doom-1993',
        title: 'DOOM (1993)',
        release_year: 1993,
        platform: ['PC'],
        developer: 'id Software',
        genra: ['FPS'],
        era: '16-bit to Early 3D',
        primary_tech_tags: ['BSP', 'Raycasting'],
        description: 'The game that revolutionized 3D gaming and launched the FPS genre.',
    },
  })
    console.log(`✅ Game page created: ${doom.title}`)

  //4. Create the Doom deep dive article
  const article = await prisma.article.upsert({
    where: {slug: 'doom-1993-bsp'},
    update: {},
    create: {
        title: 'DOOM (1993): The Binary Space Partition that bulit a Genre',
        slug: 'doom-1993-bsp',
        excerpt: 'How a revolutionary rendering trick launched the FPS genre and changed gaming forever.',
        type: 'deep_dive',      //Encountered error: use only deep_dive, or pulse
        author_id: user.id,
        is_published: true,
        published_at: new Date(),
        difficulty: 'curious_gamer',        //check constraints in schema.prisma for allowed values
        intro_gamer: "You're a lone marine on Mars. The lights flicker, a growl echoes through the steel corridors, and a Pinky demon charges. You fire your shotgun, and the room erupts into pixelated chaos—fast. No other game in 1993 felt this visceral, this immediate. Doom didn’t just launch a genre; it rewired what players expected from a screen.",
        intro_dev: "Behind that hellish speed lay a revolutionary piece of code: Binary Space Partitioning. John Carmack's BSP implementation allowed a 1993 PC—a 33MHz 386 with 4MB RAM—to render a fully textured 3D world at playable speeds without a dedicated graphics card. It was a masterclass in trading precomputation for runtime performance.",
        pixel_section: "**The Technical Challenge:** Before Doom, 3D games like Wolfenstein 3D used raycasting on a strict 2D grid, limiting walls to 90-degree angles. Carmack wanted variable floor/ceiling heights, non-orthogonal walls, and dynamic lighting.\n\n**The Solution: BSP Trees**\n- Preprocessing step that recursively divides the map into convex subspaces.\n- During gameplay, the engine traverses the tree back-to-front, drawing walls in correct order without a Z-buffer. No overdraw. No pixel wasted.\n- This allowed sloped floors, moving platforms, and variable lighting.\n\n**Hardware Context:** 386/486 CPUs at 25–66 MHz, no GPU acceleration. Doom’s smooth scrolling at 35fps was science fiction.",
        story_section: "**The Player Experience:** Doom’s speed birthed a new *feel* — strafing past an Imp’s fireball felt like dancing. Deathmatch wasn’t a planned feature; it emerged from fast netcode and faster rendering.\n\n**The Ripple Effect:** The modding scene exploded because Carmack kept the WAD format open. BSP trees became a standard tool in game engines for decades. Doom was installed on more computers than Windows 95 at one point.",
        connecting_thread: "Without BSP, there is no sloped floor in E1M2’s dark corridor. Without that sloped floor, the encounter with the Pinky isn’t a heart-pounding chase. The fear, the pacing, the emergent storytelling of Doom’s level design were made possible because the engine could render a non-orthogonal world fast enough to immerse you.",
        open_question: "What modern game mechanic do you think owes its existence to an old-school technical hack like BSP? Devs, drop your favorite examples of restricted hardware birthing creative design.",
    },
  })
  console.log(`✅ Article created: ${article.title}`)

  //5. Connect Article to tags
  for (const tag of tags) {
    await prisma.articleTag.upsert({
        where: { article_id_tag_id: { article_id: article.id, tag_id: tag.id } },
        update: {},
        create: { article_id: article.id, tag_id: tag.id },
    })
  }
  console.log(`✅ Article connected to tags: ${tags.map(t => t.name).join(', ')}`)

  //6. Connect Article to Game Page
  await prisma.articleGameLink.upsert({
    where: { article_id_game_id: { article_id: article.id, game_id: doom.id}},
    update: {},
    create: { article_id: article.id, game_id: doom.id },
  })
  console.log(`✅ Article connected to game page: ${doom.title}`)
  
  //end here - The data for seeding ends here
  console.log('\n🎉 All done! Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })