'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface MobileMenuProps {
  isLoggedIn: boolean
  username?: string
  isCreator?: boolean
}

export default function MobileMenu({ isLoggedIn, username, isCreator }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-gray-300 hover:text-white transition"
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Menu panel – slides in from the right */}
          <div className="relative ml-auto w-72 max-w-full bg-[#0B0F19] border-l border-gray-800 p-6 overflow-y-auto shadow-2xl animate-slide-in">
            {/* Close button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col space-y-3">
              {isLoggedIn ? (
                <>
                  {/* Profile link */}
                  <Link
                    href={`/profile/${username}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                      {username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span>{username}</span>
                  </Link>

                  {isCreator && (
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                    >
                      Dashboard
                    </Link>
                  )}

                  <Link
                    href="/write"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                  >
                    Write
                  </Link>

                  <Link
                    href="/bookmarks"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                  >
                    Bookmarks
                  </Link>

                  <Link
                    href="/change-password"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                  >
                    Change Password
                  </Link>

                  <button
                    onClick={async () => {
                        setOpen(false)
                        const supabase = createClient()
                        await supabase.auth.signOut()
                        router.push(',')
                        router.refresh()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-gray-800 transition text-gray-300 hover:text-white"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-center font-semibold transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}