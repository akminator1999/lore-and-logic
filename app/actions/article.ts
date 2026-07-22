'use server'

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Create and publish an article from the submitted form data.
 * requires authenticated supabase user
 * Create any missing tags, links tags and an optional game
 */

export async function createArticle(formData: FormData) {

  //Get currently authenticated supabase user.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
    //resolve the authenticated acct. to the corresponding app database user.
  const customUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true },
  })
  if (!customUser) throw new Error('Profile not found')
  
  //Read the shared article fields sumitted by the form
  const title = formData.get('title') as string
  let slug = (formData.get('slug') as string) || ''
  
  //genereate url friendly slug from the title
  if (!slug) {
    slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }
  const excerpt = formData.get('excerpt') as string
  const type = formData.get('type') as string
  const coverImageUrl = formData.get('cover_image_url') as string || null
  const difficulty = formData.get('difficulty') as string || null
  
  /*
  Removed this feature for now as difficulty will do the same function.
  const audience = formData.get('audience') as string || 'all'
  */
  
  //convert a comma separated tag list into individual tag names
  const tagNames = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)
  
  const gameSlug = formData.get('game_slug') as string || null

  //Start with fields common to every article type
  const articleData: any = {
    slug,
    title,
    excerpt,
    type,
    cover_image_url: coverImageUrl,
    author_id: customUser.id,
    is_published: true,
    published_at: new Date(),
    difficulty: type === 'deep_dive' ? difficulty : null,
    /*
    Removed Feature
    audience,
    */
  }

  //content structure
  if (type === 'deep_dive') {
    articleData.intro_gamer = formData.get('intro_gamer') as string
    articleData.intro_dev = formData.get('intro_dev') as string
    articleData.pixel_section = formData.get('pixel_section') as string
    articleData.story_section = formData.get('story_section') as string
    articleData.connecting_thread = formData.get('connecting_thread') as string
    articleData.open_question = formData.get('open_question') as string
  } else {
    articleData.news_hook = formData.get('news_hook') as string
    articleData.gamer_angle = formData.get('gamer_angle') as string
    articleData.dev_angle = formData.get('dev_angle') as string
    articleData.source_url = formData.get('source_url') as string || null
  }

  const article = await prisma.article.create({ data: articleData })

  // Linking tags and creating missing Tags
  for (const tagName of tagNames) {
    const tag = await prisma.tag.findUnique({ where: { name: tagName } })
    if (tag) {
      await prisma.articleTag.create({ data: { article_id: article.id, tag_id: tag.id } })
    } else {
      // Optionally create a new tag
      const newTag = await prisma.tag.create({ data: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') } })
      await prisma.articleTag.create({ data: { article_id: article.id, tag_id: newTag.id } })
    }
  }

  // Game link 
  if (gameSlug) {
    const game = await prisma.gamePage.findUnique({ where: { slug: gameSlug } })
    if (game) {
      await prisma.articleGameLink.create({ data: { article_id: article.id, game_id: game.id } })
    }
  }

  // Refresh cached homepage content and take the author to new article.
  revalidatePath('/')
  redirect(`/articles/${article.slug}`)
}

//update article function to edit existing article

export async function updateArticle( articleId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user }} = await supabase.auth.getUser()
  if(!user) throw new Error('Not Authenticated')

  const customUser = await prisma.user.findUnique({
    where: { email: user.email!},
    select: { id: true, badge: true},
  })
  if(!customUser || customUser.badge !== 'Creator') throw new Error('Only creators can edit!')

  //1. Verify the article belongs to this user
  const existing = await prisma.article.findUnique({
    where: { id: articleId},
    select: { author_id: true, type: true},
  })
  if (!existing || existing.author_id !== customUser.id) {
    throw new Error('Not authorised')
  }

  const title = formData.get('title') as string
  const excerpt = formData.get('excerpt') as string
  const coverImageUrl = formData.get('cover_image_url') as string || null
  const tagNames = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)
  const gameSlug = formData.get('game_slug') as string || null

  const updateData: any = {
    title,
    excerpt,
    cover_image_url: coverImageUrl,
    updated_at: new Date(),
  }

  if (existing.type === 'deep_dive') {
    updateData.intro_gamer = formData.get('intro_gamer') as string
    updateData.intro_dev = formData.get('intro_dev') as string
    updateData.pixel_section = formData.get('pixel_section') as string
    updateData.story_section = formData.get('story_section') as string
    updateData.connecting_thread = formData.get('connecting_thread') as string
    updateData.open_question = formData.get('open_question') as string
    updateData.difficulty = formData.get('difficulty') as string
  } else {
    updateData.news_hook = formData.get('news_hook') as string
    updateData.gamer_angle = formData.get('gamer_angle') as string
    updateData.dev_angle = formData.get('dev_angle') as string
    updateData.source_url = formData.get('source_url') as string || null
  }

  //2. Update article
  await prisma.article.update({ where: {id: articleId}, data: updateData })

  //3. Update tags - delete old links, create new ones
  await prisma.articleTag.deleteMany({ where: { article_id: articleId }})
  for (const tagName of tagNames) {
    const tag = await prisma.tag.findUnique({ where: {name: tagName}})
    if (tag) {
      await prisma.articleTag.create({data: {article_id: articleId, tag_id: tag.id}})
    } else {
      const newTag = await prisma.tag.create({ data: { name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-')}})
      await prisma.articleTag.create({ data: { article_id: articleId, tag_id: newTag.id}})
    }
  }

  //4. Update game Link
  await prisma.articleGameLink.deleteMany({ where: { article_id: articleId}})
  if (gameSlug) {
    const game = await prisma.gamePage.findUnique({ where: { slug: gameSlug}})
    if(game) {
      await prisma.articleGameLink.create({ data: { article_id: articleId, game_id: game.id}})
    }
  }

  revalidatePath(`/articles/${existing.type === 'deep_dive' ? 'deep_dive' : 'pulse'}`)
  revalidatePath(`/articles/${formData.get('slug')}`)
  //formData.get('slug') still works because we'll keep the slug field (read-only or hidden) in the edit form ro preserve the URL.The slug should't chang eon edit avoid broken link
  redirect(`/articles/${formData.get('slug')}`)
}