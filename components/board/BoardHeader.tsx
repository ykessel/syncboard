'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, UserPlus } from 'lucide-react'
import InviteMembersModal from '@/components/org/InviteMembersModal'
import type { Board, PresenceUser } from '@/types'

interface BoardHeaderProps {
  board: Board
  presence: PresenceUser[]
}

function PresenceAvatar({ user }: { user: PresenceUser }) {
  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
  return (
    <div className="relative" title={user.name ?? 'User'}>
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name ?? ''}
          className="w-7 h-7 rounded-full border-2 border-[#0d0d14] object-cover"
        />
      ) : (
        <div className="w-7 h-7 rounded-full border-2 border-[#0d0d14] bg-indigo-500/30 flex items-center justify-center text-xs font-semibold text-indigo-300">
          {initials}
        </div>
      )}
      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-[#0d0d14]" />
    </div>
  )
}

export default function BoardHeader({ board, presence }: BoardHeaderProps) {
  const [showInvite, setShowInvite] = useState(false)

  const uniquePresence = presence.filter(
    (u, i, arr) => arr.findIndex(p => p.user_id === u.user_id) === i
  )

  return (
    <>
      <header className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[#0d0d14] flex-shrink-0">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>

        {/* Color dot + title */}
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: board.color }} />
          <h1 className="font-semibold text-white text-sm truncate max-w-[240px]">{board.title}</h1>
        </div>

        <div className="flex-1" />

        {/* Presence */}
        {uniquePresence.length > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1.5">
              {uniquePresence.slice(0, 5).map(u => (
                <PresenceAvatar key={u.user_id} user={u} />
              ))}
            </div>
            {uniquePresence.length > 5 && (
              <span className="text-xs text-slate-400 ml-1">+{uniquePresence.length - 5}</span>
            )}
            <span className="text-xs text-slate-500 ml-2 hidden sm:block">
              {uniquePresence.length} online
            </span>
          </div>
        )}

        {/* Invite button */}
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:block">Invite</span>
        </button>
      </header>

      {showInvite && (
        <InviteMembersModal
          type="board"
          targetId={board.id}
          targetName={board.title}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  )
}
