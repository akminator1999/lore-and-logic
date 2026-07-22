import { createClient } from '@/lib/supabase/server'
import { Analytics } from "@vercel/analytics/next"
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Lore & Logic',
    template: '%s | Lore & Logic', //%s will be replaced by the page title
  },
  description: 'The coomunity where gamers and developers connect to explore how games are made - from the pixel to the story, across every era.',
  openGraph: {
    siteName: 'Lore & Logic',
    title: 'Lore & Logic',
    description: 'The community where gamers and developers conect to explore how games are made.',
    url: 'https://theloreandlogic.com',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Lore & Logic'
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lore & Logic',
    description: 'The community where gamers and developers connect.',
    images: ['/logo.png'],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const supabaseUser = data?.user ?? null

  // Fetch the custom User record (username) for the logged-in user
  let customUser = null
  if (supabaseUser?.email) {
    customUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email },
      select: { username: true, badge: true },
    })
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-white">
        <header className="border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent"
          >
            Lore &amp; Logic
          </Link>
          <nav className="flex items-center space-x-4 text-sm text-gray-300">
            {supabaseUser && customUser ? (
              <>
                <Link
                  href={`/profile/${customUser.username}`}
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {supabaseUser.email?.[0].toUpperCase()}
                  </div>
                  <span className="hidden md:inline">{customUser.username}</span>
                </Link>
                {customUser.badge === 'Creator' && (
                  <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
                )}
                <Link href="/write" className="hover:text-white transition">
                  Write
                </Link>
                <Link href="/bookmarks" className="hover:text-white transition">
                  Bookmarks
                </Link>
                <Link href="/change-password" className="hover:text-white transition">
                  Change Password
                </Link>
                <form action="/auth/signout" method="post">
                  <button className="hover:text-white transition">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-white transition">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-white transition">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}