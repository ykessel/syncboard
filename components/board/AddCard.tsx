'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { createCard } from '@/actions/cards'

interface AddCardProps {
  columnId: string
  boardId: string
  currentUserId: string
}

export default function AddCard({ columnId, boardId, currentUserId }: AddCardProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleAdd() {
    if (!value.trim()) return
    const title = value.trim()
    setValue('')
    startTransition(async () => {
      await createCard(columnId, boardId, title)
    })
    // Keep open to add more cards
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
    if (e.key === 'Escape') {
      setOpen(false)
      setValue('')
    }
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition py-1 px-1 rounded"
      >
        <Plus className="w-3.5 h-3.5" />
        Add card
      </button>
    )
  }

  return (
    <div>
      <textarea
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Card title…"
        rows={2}
        className="w-full bg-[#1c1c2e] border border-indigo-500/50 text-white placeholder-slate-600 text-xs px-2.5 py-2 rounded-lg outline-none resize-none focus:ring-1 focus:ring-indigo-500 mb-2"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdd}
          disabled={!value.trim() || isPending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          Add
        </button>
        <button
          onClick={() => { setOpen(false); setValue('') }}
          className="text-slate-400 hover:text-white transition p-1 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
