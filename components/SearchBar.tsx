'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { search, type SearchResult } from '@/app/actions/search'

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch results on query change
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      const data = await search(query)
      setResults(data)
      setLoading(false)
    }, 200) // debounce 200ms

    return () => clearTimeout(timer)
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
    if (e.key === 'Enter' && results.length > 0) {
      const first = results[0]
      router.push(first.type === 'article' ? `/articles/${first.slug}` : `/game/${first.slug}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.type === 'article' ? `/articles/${result.slug}` : `/game/${result.slug}`)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Search icon / toggle */}
      <button
        onClick={() => {
          setIsOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="text-gray-300 hover:text-white transition p-1"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-md md:absolute md:top-10 md:left-auto md:right-0 md:translate-x-0 md:w-80 bg-[#131a2c] border border-gray-700 rounded-xl shadow-2xl z-50 p-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles, games..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-purple-500"
          />

          {/* Loading indicator */}
          {loading && (
            <div className="mt-2 text-center text-gray-400 text-sm animate-pulse">Searching…</div>
          )}

          {/* Results */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <p className="mt-2 text-gray-500 text-sm">No results found.</p>
          )}

          {results.length > 0 && (
            <ul className="mt-2 space-y-1 max-h-64 overflow-y-auto">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <span className={`text-xs px-2 py-0.5 rounded-full uppercase ${
                      result.type === 'article' ? 'bg-cyan-900/50 text-cyan-300' : 'bg-purple-900/50 text-purple-300'
                    }`}>
                      {result.type === 'article' ? 'Article' : 'Game'}
                    </span>
                    <span className="text-sm text-gray-200 truncate">{result.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}