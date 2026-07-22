import Link from 'next/link'

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center">
      <div className="text-center px-4">
        {/* Icon */}
        <div className="text-6xl mb-6">🔒</div>

        {/* Title with gradient accent */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Access Denied
          </span>
        </h1>

        {/* Message */}
        <p className="text-gray-300 max-w-xl mx-auto mb-4 text-lg">
          Only users with the{' '}
          <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-sm font-semibold">
            Creator
          </span>{' '}
          badge can access the Write page.
        </p>
        <p className="text-gray-500 mb-8">
          If you’re a developer, make sure you signed up with the{' '}
          <span className="text-cyan-400">Developer</span> role.
        </p>

        {/* Back to Home link styled as a button */}
        <Link
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-full transition shadow-lg"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}