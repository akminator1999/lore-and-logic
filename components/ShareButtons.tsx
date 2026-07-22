'use client'

import { useState } from 'react'

export default function ShareButtons({
  title,
  url,
}: {
  title: string
  url: string
}) {
  const [copied, setCopied] = useState(false)

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3 py-4">
      <span className="text-sm text-gray-400">Share:</span>

      {/* Twitter */}
      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-full transition"
        title="Share on Twitter"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      {/* Facebook */}
      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-full transition"
        title="Share on Facebook"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </a>

      {/* Reddit */}
      <a
        href={shareLinks.reddit}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-full transition"
        title="Share on Reddit"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.191-4.259-1.949-6.971-2.046l1.483-4.669 4.016.941-.001.058c0 1.193.974 2.163 2.174 2.163 1.2 0 2.174-.97 2.174-2.163S21.403 2.1 20.203 2.1c-.974 0-1.804.638-2.092 1.513l-4.628-1.085-1.683 5.296c-2.85.058-5.417.83-7.29 2.066-.498-.512-1.184-.828-1.941-.828C1.19 9.062 0 10.248 0 11.707c0 .994.549 1.856 1.362 2.307-.032.198-.045.398-.045.6 0 3.448 4.167 6.251 9.293 6.251 5.178 0 9.336-2.845 9.336-6.293 0-.166-.009-.332-.031-.495.741-.46 1.213-1.275 1.213-2.214zM4.48 13.035c0-.872.712-1.581 1.59-1.581.877 0 1.589.709 1.589 1.581 0 .874-.712 1.582-1.589 1.582-.878 0-1.59-.708-1.59-1.582zm12.122 4.273c-1.383 1.381-4.023 1.484-5.202.546-.182-.146-.215-.4-.074-.584.14-.183.396-.217.58-.074.77.64 2.744.52 3.69-.423.215-.215.56-.215.775 0 .218.218.218.572 0 .79zm.231-2.691c-.879 0-1.59-.708-1.59-1.582 0-.872.711-1.581 1.59-1.581.878 0 1.589.709 1.589 1.581 0 .874-.711 1.582-1.589 1.582z"/>
        </svg>
      </a>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white p-2 rounded-full transition relative"
        title="Copy link"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </button>
    </div>
  )
}