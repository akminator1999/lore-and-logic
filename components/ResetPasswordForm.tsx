'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  // Extract recovery token from the URL hash when the component mounts
  useEffect(() => {
    const supabase = createClient()

    // The hash contains #access_token=xxx&refresh_token=yyy&type=recovery
    // We can use supabase.auth.getSession() which automatically reads the hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true) // session is set, we can now update the password
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ready) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Password updated successfully
      await supabase.auth.signOut() // optional: force re-login
      router.push('/login?message=Password updated. You can now log in.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="text-gray-300 text-sm">New Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={!ready}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 mt-1 disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !ready}
        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
      >
        {loading ? 'Saving…' : 'Set Password'}
      </button>
    </form>
  )
}