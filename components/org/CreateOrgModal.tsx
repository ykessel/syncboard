'use client'

import { useState, useTransition } from 'react'
import { X, Building2, Loader2 } from 'lucide-react'
import { createOrganization } from '@/actions/organizations'

interface CreateOrgModalProps {
  onClose: () => void
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

export default function CreateOrgModal({ onClose }: CreateOrgModalProps) {
  const [name, setName]     = useState('')
  const [slug, setSlug]     = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [isPending, start]  = useTransition()

  function handleNameChange(v: string) {
    setName(v)
    if (!slugEdited) setSlug(slugify(v))
  }

  function handleSlugChange(v: string) {
    setSlug(slugify(v))
    setSlugEdited(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const result = await createOrganization({ name, slug })
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#14141f] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">New Organization</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Organization name</label>
            <input
              autoFocus
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Acme Corp"
              required
              className="w-full bg-[#1c1c2e] border border-white/10 text-white placeholder-slate-600 text-sm px-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">URL slug</label>
            <div className="flex items-center gap-0">
              <span className="text-xs text-slate-500 bg-[#111] border border-r-0 border-white/10 px-3 py-2.5 rounded-l-lg select-none">
                syncboard.app/
              </span>
              <input
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="acme-corp"
                required
                className="flex-1 bg-[#1c1c2e] border border-white/10 text-white placeholder-slate-600 text-sm px-3 py-2.5 rounded-r-lg outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <p className="text-[11px] text-slate-600 mt-1">Lowercase letters, numbers, and hyphens only.</p>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !name.trim() || !slug.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
            >
              {isPending ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…</> : 'Create organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
