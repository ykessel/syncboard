'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, Building2, User, Plus, Check } from 'lucide-react'
import type { Organization } from '@/types'
import CreateOrgModal from './CreateOrgModal'

interface OrgSwitcherProps {
  orgs: Organization[]
  collapsed: boolean
}

export default function OrgSwitcher({ orgs, collapsed }: OrgSwitcherProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const activeOrg    = searchParams.get('org')

  const [open, setOpen]           = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  const currentOrg = orgs.find(o => o.slug === activeOrg) ?? null

  function select(slug: string | null) {
    setOpen(false)
    if (slug) {
      router.push(`/dashboard?org=${slug}`)
    } else {
      router.push('/dashboard')
    }
  }

  const label = currentOrg?.name ?? 'Personal'

  if (collapsed) {
    return (
      <div className="px-2 py-2 border-b border-white/8">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition"
          title={label}
        >
          {currentOrg ? (
            <div className="w-5 h-5 rounded-md bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-[9px] font-bold text-indigo-300">
              {currentOrg.name.slice(0,1).toUpperCase()}
            </div>
          ) : (
            <User className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {open && (
          <WorkspaceDropdown
            orgs={orgs}
            activeOrg={activeOrg}
            onSelect={select}
            onClose={() => setOpen(false)}
            onCreateOrg={() => { setOpen(false); setShowCreate(true) }}
          />
        )}
        {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} />}
      </div>
    )
  }

  return (
    <div className="relative px-2 py-2 border-b border-white/8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition text-left"
      >
        {currentOrg ? (
          <div className="w-5 h-5 rounded-md bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-[9px] font-bold text-indigo-300 flex-shrink-0">
            {currentOrg.name.slice(0,1).toUpperCase()}
          </div>
        ) : (
          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
        <span className="flex-1 text-xs font-medium text-white truncate">{label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <WorkspaceDropdown
          orgs={orgs}
          activeOrg={activeOrg}
          onSelect={select}
          onClose={() => setOpen(false)}
          onCreateOrg={() => { setOpen(false); setShowCreate(true) }}
        />
      )}

      {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function WorkspaceDropdown({
  orgs, activeOrg, onSelect, onClose, onCreateOrg,
}: {
  orgs: Organization[]
  activeOrg: string | null
  onSelect: (slug: string | null) => void
  onClose: () => void
  onCreateOrg: () => void
}) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute left-2 right-2 top-full mt-1 z-40 bg-[#1c1c2e] border border-white/10 rounded-xl shadow-2xl py-1.5 overflow-hidden">
        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider px-3 py-1.5">Workspaces</p>

        {/* Personal */}
        <button
          onClick={() => onSelect(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition hover:bg-white/5 ${!activeOrg ? 'text-white' : 'text-slate-400'}`}
        >
          <div className="w-5 h-5 rounded-md bg-slate-500/30 flex items-center justify-center flex-shrink-0">
            <User className="w-3 h-3 text-slate-400" />
          </div>
          <span className="flex-1 text-left">Personal</span>
          {!activeOrg && <Check className="w-3 h-3 text-indigo-400" />}
        </button>

        {orgs.length > 0 && <div className="h-px bg-white/5 mx-2 my-1" />}

        {orgs.map(org => (
          <button
            key={org.id}
            onClick={() => onSelect(org.slug)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition hover:bg-white/5 ${activeOrg === org.slug ? 'text-white' : 'text-slate-400'}`}
          >
            <div className="w-5 h-5 rounded-md bg-indigo-500/30 border border-indigo-500/20 flex items-center justify-center text-[9px] font-bold text-indigo-300 flex-shrink-0">
              {org.name.slice(0,1).toUpperCase()}
            </div>
            <span className="flex-1 text-left truncate">{org.name}</span>
            {activeOrg === org.slug && <Check className="w-3 h-3 text-indigo-400" />}
          </button>
        ))}

        <div className="h-px bg-white/5 mx-2 my-1" />

        <button
          onClick={onCreateOrg}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-500 hover:text-indigo-400 hover:bg-white/5 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          New organization
        </button>
      </div>
    </>
  )
}
