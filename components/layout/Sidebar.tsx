'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Plus, ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { signOut } from '@/actions/auth'
import OrgSwitcher from '@/components/org/OrgSwitcher'
import type { Profile, Organization } from '@/types'

interface SidebarProps {
  profile: Profile | null
  orgs: Organization[]
}

function Avatar({ name, avatarUrl, size = 'sm' }: { name: string | null; avatarUrl: string | null; size?: 'sm' | 'md' }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name ?? ''} className={`${sizeClass} rounded-full object-cover flex-shrink-0`} />
  }
  return (
    <div className={`${sizeClass} rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center font-semibold text-indigo-300 flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function Sidebar({ profile, orgs }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(() => signOut())
  }

  return (
    <aside
      className={`relative flex flex-col border-r border-white/8 bg-[#14141f] transition-all duration-200 ${
        collapsed ? 'w-14' : 'w-56'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-3.5 py-4 border-b border-white/8 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
            <rect x="3" y="3" width="7" height="18" rx="1" />
            <rect x="14" y="3" width="7" height="10" rx="1" />
            <rect x="14" y="17" width="7" height="4" rx="1" />
          </svg>
        </div>
        {!collapsed && <span className="font-semibold text-white text-sm">Syncboard</span>}
      </div>

      {/* Workspace switcher */}
      <OrgSwitcher orgs={orgs} collapsed={collapsed} />

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
            pathname === '/dashboard'
              ? 'bg-indigo-500/15 text-indigo-300'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          } ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Dashboard' : undefined}
        >
          <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </Link>

        {!collapsed && (
          <>
            <div className="pt-4 pb-1 px-2.5">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Boards</p>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New board
            </Link>
          </>
        )}
      </nav>

      {/* Profile */}
      <div className={`border-t border-white/8 p-2 ${collapsed ? '' : 'px-3'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-1.5 py-2 mb-1">
            <Avatar name={profile?.name ?? null} avatarUrl={profile?.avatar_url ?? null} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{profile?.name ?? 'User'}</p>
              <p className="text-[10px] text-slate-600 truncate">{orgs.length} org{orgs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleSignOut}
          disabled={isPending}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-[#14141f] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  )
}
