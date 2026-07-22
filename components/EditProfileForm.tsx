'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'

interface Profile {
  username: string
  bio: string | null
  avatar_url: string | null
  role: string
  favorite_genres: string[]
  dev_role: string | null
  games_worked_on: string[]
}

export default function EditProfileForm({ profile }: { profile: Profile }) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)

    const result = await updateProfile(formData)

    if (result && result.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="text-gray-300 text-sm">Username</label>
        <input
          name="username"
          defaultValue={profile.username}
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm">Bio</label>
        <textarea
          name="bio"
          defaultValue={profile.bio || ''}
          rows={3}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm">Avatar URL</label>
        <input
          name="avatar_url"
          defaultValue={profile.avatar_url || ''}
          placeholder="https://..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
        />
      </div>

      <div>
        <label className="text-gray-300 text-sm">Favorite Genres (comma separated)</label>
        <input
          name="favorite_genres"
          defaultValue={profile.favorite_genres.join(', ')}
          placeholder="RPG, FPS, Puzzle"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
        />
      </div>

      {profile.role === 'developer' && (
        <>
          <div>
            <label className="text-gray-300 text-sm">Developer Role</label>
            <input
              name="dev_role"
              defaultValue={profile.dev_role || ''}
              placeholder="Programmer, Designer, Artist…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm">Games Worked On (comma separated)</label>
            <input
              name="games_worked_on"
              defaultValue={profile.games_worked_on.join(', ')}
              placeholder="Game Title 1, Game Title 2"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
            />
          </div>
        </>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition"
      >
        {isLoading ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  )
}