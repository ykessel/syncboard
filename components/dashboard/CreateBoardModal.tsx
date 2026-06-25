'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createBoard } from '@/actions/boards'

interface CreateBoardModalProps {
  colors: string[]
  asCard?: boolean
  orgId?: string
}

export default function CreateBoardModal({ colors, asCard, orgId }: CreateBoardModalProps) {
  const [open, setOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(colors[0])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createBoard({
        title: form.get('title') as string,
        description: (form.get('description') as string) || undefined,
        color: selectedColor,
        org_id: orgId,
      })
      if (result?.error) setError(result.error)
    })
  }

  const trigger = asCard ? (
    <button
      onClick={() => setOpen(true)}
      className="group bg-[#14141f] border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/30 transition-all min-h-[160px]"
    >
      <Plus className="w-6 h-6" />
      <span className="text-sm font-medium">New board</span>
    </button>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition"
    >
      <Plus className="w-4 h-4" />
      New board
    </button>
  )

  return (
    <>
      {trigger}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#14141f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="font-semibold text-white">Create board</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                        selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#14141f] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Board name <span className="text-slate-500">*</span>
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Product Roadmap"
                  className="w-full bg-[#1c1c2e] border border-white/10 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Optional description…"
                  className="w-full bg-[#1c1c2e] border border-white/10 text-white placeholder-slate-500 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Preview */}
              <div
                className="rounded-xl h-16 border flex items-center px-4"
                style={{
                  background: `linear-gradient(135deg, ${selectedColor}22, ${selectedColor}08)`,
                  borderColor: `${selectedColor}30`,
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-sm text-slate-300 font-medium">Board preview</span>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-medium py-2.5 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isPending ? 'Creating…' : 'Create board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
