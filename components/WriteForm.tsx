'use client'

import { useState } from 'react'
import { createArticle, updateArticle } from '@/app/actions/article'
import RichTextEditor from './RichTextEditor'

interface WriteFormProps {
  article?: any   // optional existing article data for editing
}

export default function WriteForm({ article }: WriteFormProps) {
  const isEditing = !!article
  const [type, setType] = useState<'deep_dive' | 'pulse'>(article?.type || 'deep_dive')
  const [slug, setSlug] = useState(article?.slug || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    if (isEditing) {
      await updateArticle(article.id, formData)
    } else {
      await createArticle(formData)
    }
  }

  const autoSlug = (title: string) => {
    if (!isEditing && !slug) {
      setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isEditing && <input type="hidden" name="slug" value={article.slug} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-300 text-sm">Title</label>
          <input
            name="title"
            required
            defaultValue={article?.title || ''}
            onChange={(e) => autoSlug(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2"
          />
        </div>
        <div>
          <label className="text-gray-300 text-sm">Slug</label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated"
            disabled={isEditing}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 disabled:opacity-50"
          />
        </div>
      </div>

      <div>
        <label className="text-gray-300 text-sm">Excerpt</label>
        <textarea name="excerpt" rows={2} defaultValue={article?.excerpt || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="text-gray-300 text-sm">Type</label>
          <select name="type" value={type} onChange={(e) => setType(e.target.value as any)} disabled={isEditing} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 disabled:opacity-50">
            <option value="deep_dive">Deep Dive</option>
            <option value="pulse">Pulse</option>
          </select>
        </div>
        <div>
          <label className="text-gray-300 text-sm">Cover Image URL</label>
          <input name="cover_image_url" defaultValue={article?.cover_image_url || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
        </div>
        {type === 'deep_dive' && (
          <>
            <div>
              <label className="text-gray-300 text-sm">Difficulty</label>
              <select name="difficulty" defaultValue={article?.difficulty || 'curious_gamer'} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2">
                <option value="curious_gamer">Curious Gamer</option>
                <option value="aspiring_dev">Aspiring Dev</option>
                <option value="seasoned_pro">Seasoned Pro</option>
              </select>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-gray-300 text-sm">Tags (comma separated)</label>
          <input name="tags" defaultValue={article?.ArticleTag?.map((at: any) => at.Tag.name).join(', ') || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" placeholder="FPS, 16-bit Era, ..." />
        </div>
        <div>
          <label className="text-gray-300 text-sm">Game Slug (optional)</label>
          <input name="game_slug" defaultValue={article?.ArticleGameLink?.[0]?.GamePage?.slug || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" placeholder="doom-1993" />
        </div>
      </div>

      {type === 'deep_dive' ? (
        <>
          <RichTextEditor id="intro_gamer" name="intro_gamer" label="🎮 For the Player (Intro)" defaultValue={article?.intro_gamer || ''} rows={6} />
          <RichTextEditor id="intro_dev" name="intro_dev" label="🔧 For the Creator (Intro)" defaultValue={article?.intro_dev || ''} rows={6} />
          <RichTextEditor id="pixel_section" name="pixel_section" label="⚙️ The Pixel: The Craft" defaultValue={article?.pixel_section || ''} rows={10} />
          <RichTextEditor id="story_section" name="story_section" label="📖 The Story: The Impact" defaultValue={article?.story_section || ''} rows={10} />
          <RichTextEditor id="connecting_thread" name="connecting_thread" label="🔗 The Connecting Thread" defaultValue={article?.connecting_thread || ''} rows={6} />
          <RichTextEditor id="open_question" name="open_question" label="💬 Community Question" defaultValue={article?.open_question || ''} rows={3} />
        </>
      ) : (
        <>
          <RichTextEditor id="news_hook" name="news_hook" label="News Hook" defaultValue={article?.news_hook || ''} rows={6} />
          <RichTextEditor id="gamer_angle" name="gamer_angle" label="🎮 For Gamers" defaultValue={article?.gamer_angle || ''} rows={8} />
          <RichTextEditor id="dev_angle" name="dev_angle" label="🔧 For Developers" defaultValue={article?.dev_angle || ''} rows={8} />
          <div>
            <label className="text-gray-300 text-sm">Source URL</label>
            <input name="source_url" defaultValue={article?.source_url || ''} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2" />
          </div>
        </>
      )}

      <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-2 rounded-lg transition">
        {isEditing ? 'Update Article' : 'Publish Article'}
      </button>
    </form>
  )
}