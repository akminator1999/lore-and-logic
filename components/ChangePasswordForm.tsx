'use client'

import { useState } from 'react'
import { changePassword } from '@/app/actions/auth'

export default function ChangePasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        const form = e.currentTarget as HTMLFormElement
        const formData = new FormData(form)

        //We call the server action directly (not via form action) to handle error state
        const result = await changePassword(formData)

        // If there's an error, the server action returns it; otherwise it redirects
        if (result && result.error) {
            setError(result.error)
            setIsLoading(false)
        }
        //If successful,the action will redirect, so no need to reset loading
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-gray-300 text-sm">Current Password</label>
        <input
          name="currentPassword"
          type="password"
          required
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
        />
      </div>
      <div>
        <label className="text-gray-300 text-sm">New Password</label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
        />
      </div>
      <div>
        <label className="text-gray-300 text-sm">Confirm New Password</label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
      >
        {isLoading ? 'Updating…' : 'Update Password'}
      </button>
    </form>
    )
}