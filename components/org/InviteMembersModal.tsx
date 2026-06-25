'use client'

import { useState, useEffect, useTransition } from 'react'
import { X, Link2, Copy, Check, Trash2, Loader2, UserPlus, RefreshCw } from 'lucide-react'
import { createOrgInvite, createBoardInvite, getOrgInvites, getBoardInvites, revokeInvite } from '@/actions/invitations'

interface InviteMembersModalProps {
  type: 'org' | 'board'
  targetId: string   // org.id or board.id
  targetName: string
  onClose: () => void
}

function timeLeft(expires: string) {
  const diff = new Date(expires).getTime() - Date.now()
  if (diff < 0) return 'Expired'
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return `${hours}h left`
  const days = Math.floor(hours / 24)
  return `${days}d left`
}

export default function InviteMembersModal({ type, targetId, targetName, onClose }: InviteMembersModalProps) {
  const [invites, setInvites]     = useState<any[]>([])
  const [role, setRole]           = useState<'admin' | 'member'>('member')
  const [copied, setCopied]       = useState<string | null>(null)
  const [isPending, start]        = useTransition()
  const [loading, setLoading]     = useState(true)

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  async function loadInvites() {
    setLoading(true)
    const data = type === 'org'
      ? await getOrgInvites(targetId)
      : await getBoardInvites(targetId)
    setInvites(data)
    setLoading(false)
  }

  useEffect(() => { loadInvites() }, [])

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${baseUrl}/invite/${token}`)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  function generateInvite() {
    start(async () => {
      const result = type === 'org'
        ? await createOrgInvite(targetId, role)
        : await createBoardInvite(targetId)
      if (result && 'token' in result) {
        await loadInvites()
        copyLink(result.token as string)
      }
    })
  }

  function handleRevoke(inviteId: string) {
    start(async () => {
      await revokeInvite(inviteId)
      setInvites(prev => prev.filter(i => i.id !== inviteId))
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#14141f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Invite people</h2>
              <p className="text-xs text-slate-500">{targetName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Generate link row */}
          <div className="flex items-center gap-2">
            {type === 'org' && (
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'admin' | 'member')}
                className="bg-[#1c1c2e] border border-white/10 text-white text-xs px-2.5 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            )}
            <button
              onClick={generateInvite}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 rounded-lg transition flex-1 justify-center"
            >
              {isPending
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                : <><Link2 className="w-3.5 h-3.5" /> Generate invite link</>}
            </button>
            <button onClick={loadInvites} className="p-2 text-slate-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Existing invite links */}
          <div>
            <p className="text-xs font-medium text-slate-400 mb-2">Active invite links</p>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              </div>
            ) : invites.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-600 border border-dashed border-white/8 rounded-xl">
                No active links — generate one above.
              </div>
            ) : (
              <div className="space-y-2">
                {invites.map(inv => {
                  const link = `${baseUrl}/invite/${inv.token}`
                  const isCopied = copied === inv.token
                  const expired = new Date(inv.expires_at) < new Date()
                  return (
                    <div
                      key={inv.id}
                      className={`flex items-center gap-2 p-3 rounded-xl border ${expired ? 'border-red-500/20 bg-red-500/5 opacity-60' : 'border-white/8 bg-white/3'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono text-slate-300 truncate">{link}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {inv.role && (
                            <span className="text-[10px] text-slate-500 capitalize">{inv.role}</span>
                          )}
                          <span className="text-[10px] text-slate-600">·</span>
                          <span className={`text-[10px] ${expired ? 'text-red-400' : 'text-slate-500'}`}>
                            {timeLeft(inv.expires_at)}
                          </span>
                          <span className="text-[10px] text-slate-600">·</span>
                          <span className="text-[10px] text-slate-500">{inv.use_count} used</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => copyLink(inv.token)}
                          className={`p-1.5 rounded-lg transition ${isCopied ? 'text-green-400 bg-green-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                          title="Copy link"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleRevoke(inv.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                          title="Revoke link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-600">
            Anyone with the link can join. Links expire after 7 days.
          </p>
        </div>
      </div>
    </div>
  )
}
