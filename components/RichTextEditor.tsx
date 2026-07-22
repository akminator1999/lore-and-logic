'use client'

import { useRef, useState } from 'react'

interface RichTextEditorProps {
  id: string
  name: string
  label: string
  defaultValue?: string
  rows?: number
}

export default function RichTextEditor({ id, name, label, defaultValue = '', rows = 10 }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(defaultValue)

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const before = text.substring(0, start)
    const after = text.substring(end)
    const newText = before + textToInsert + after
    setValue(newText)
    // Set cursor after inserted text
    setTimeout(() => {
      textarea.selectionStart = start + textToInsert.length
      textarea.selectionEnd = start + textToInsert.length
      textarea.focus()
    }, 0)
  }

  const wrapSelection = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const replacement = before + selectedText + after
    insertAtCursor(replacement)
  }

  const promptAndInsert = (type: 'image' | 'youtube' | 'tweet' | 'link') => {
    const url = prompt(`Enter ${type} URL:`)
    if (!url) return
    switch (type) {
      case 'image':
        insertAtCursor(`<img src="${url}" alt="" class="rounded-xl" style="max-width:100%;" />`)
        break
      case 'youtube':
        // Extract video ID or use full URL; assume full embed URL given
        insertAtCursor(`<iframe width="560" height="315" src="${url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`)
        break
      case 'tweet':
        insertAtCursor(`<blockquote class="twitter-tweet"><a href="${url}"></a></blockquote>`)
        break
      case 'link':
        const text = prompt('Link text:') || url
        insertAtCursor(`<a href="${url}" target="_blank">${text}</a>`)
        break
    }
  }

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-gray-300 text-sm font-semibold">{label}</label>
      <div className="flex flex-wrap gap-1 mb-1">
        <button type="button" onClick={() => wrapSelection('<b>', '</b>')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">B</button>
        <button type="button" onClick={() => wrapSelection('<i>', '</i>')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">I</button>
        <button type="button" onClick={() => wrapSelection('<span style="color:#7C3AED;">', '</span>')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">Color</button>
        <button type="button" onClick={() => wrapSelection('<h2>', '</h2>')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">H2</button>
        <button type="button" onClick={() => wrapSelection('<ul>\n<li>', '</li>\n</ul>')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">List</button>
        <button type="button" onClick={() => promptAndInsert('link')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">Link</button>
        <button type="button" onClick={() => promptAndInsert('image')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">Image</button>
        <button type="button" onClick={() => promptAndInsert('youtube')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">YouTube</button>
        <button type="button" onClick={() => promptAndInsert('tweet')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">Tweet</button>
        <button type="button" onClick={() => insertAtCursor('<video controls style="max-width:100%;"><source src="" type="video/mp4"></video>')} className="bg-gray-700 px-2 py-0.5 rounded text-xs hover:bg-gray-600">Video</button>
      </div>
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm resize-y"
      />
    </div>
  )
}