'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { createColumn } from '@/actions/columns'

export default function AddColumn({ boardId }: { boardId: string }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleOpen() {
    setOpen(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleAdd() {
    if (!value.trim()) return
    const title = value.trim()
    setValue('')
    setOpen(false)
    startTransition(async () => {
      await createColumn(boardId, title)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setOpen(false); setValue('') }
  }

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="flex-shrink-0 flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/8 hover:border-white/15 text-slate-400 hover:text-white text-xs font-medium px-4 py-2.5 rounded-xl transition w-64 h-fit"
      >
        <Plus className="w-4 h-4" />
        Add column
      </button>
    )
  }

  return (
    <div className="flex-shrink-0 w-64 bg-[#14141f] border border-white/8 rounded-xl p-3">
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Column name…"
        className="w-full bg-[#1c1c2e] border border-indigo-500/50 text-white placeholder-slate-600 text-sm px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 mb-2"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleAdd}
          disabled={!value.trim() || isPending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition"
        >
          Add column
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
