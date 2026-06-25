import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInviteByToken, acceptInvite } from '@/actions/invitations'
import { Building2, Layout, UserPlus, Clock, AlertCircle } from 'lucide-react'

interface Props {
  params: Promise<{ token: string }>
}

function timeLeft(expires: string) {
  const diff = new Date(expires).getTime() - Date.now()
  if (diff < 0) return null
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default async function AcceptInvitePage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const invite = await getInviteByToken(token)

  // Invalid token
  if (!invite) {
    return <ErrorPage title="Invalid invite" message="This invite link doesn't exist or has already been revoked." />
  }

  const expired  = new Date(invite.expires_at) < new Date()
  const maxed    = invite.max_uses !== null && invite.use_count >= invite.max_uses
  const left     = timeLeft(invite.expires_at)

  if (expired) {
    return <ErrorPage title="Invite expired" message="This invite link has expired. Ask the sender to generate a new one." />
  }
  if (maxed) {
    return <ErrorPage title="Invite used up" message="This invite link has reached its maximum number of uses." />
  }

  // If user is logged in, accept immediately via server action
  if (user) {
    // We call acceptInvite which redirects on success
    const result = await acceptInvite(token)
    if (result?.error) {
      if (result.error === 'not_authenticated') {
        // shouldn't happen but handle anyway
      } else {
        return <ErrorPage title="Could not accept invite" message={result.error} />
      }
    }
    // acceptInvite redirects on success, so if we get here something unexpected happened
    redirect('/dashboard')
  }

  // Not logged in — show preview and redirect to login
  const isOrg   = invite.type === 'org'
  const org     = invite.org as any
  const board   = invite.board as any
  const inviter = invite.inviter as any

  return (
    <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
              <rect x="3" y="3" width="7" height="18" rx="1" /><rect x="14" y="3" width="7" height="10" rx="1" /><rect x="14" y="17" width="7" height="4" rx="1" />
            </svg>
          </div>
          <span className="font-semibold text-white text-lg">Syncboard</span>
        </div>

        {/* Invite card */}
        <div className="bg-[#14141f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Color bar for board invites */}
          {!isOrg && board?.color && (
            <div className="h-1.5 w-full" style={{ background: board.color }} />
          )}

          <div className="p-6">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
              {isOrg
                ? <Building2 className="w-6 h-6 text-indigo-400" />
                : <Layout className="w-6 h-6 text-indigo-400" />}
            </div>

            <div className="text-center mb-5">
              <p className="text-sm text-slate-400 mb-1">You&apos;ve been invited to join</p>
              <h1 className="text-xl font-bold text-white">
                {isOrg ? org?.name : board?.title}
              </h1>
              {isOrg && (
                <p className="text-xs text-slate-500 mt-1 capitalize">{invite.role} access</p>
              )}
            </div>

            {/* Inviter */}
            {inviter && (
              <div className="flex items-center gap-2.5 p-3 bg-white/3 border border-white/8 rounded-xl mb-4">
                {inviter.avatar_url ? (
                  <img src={inviter.avatar_url} alt={inviter.name ?? ''} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                    {(inviter.name ?? '?').slice(0,1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-white">{inviter.name ?? 'Someone'}</p>
                  <p className="text-[11px] text-slate-500">invited you</p>
                </div>
                {left && (
                  <div className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    {left} left
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <Link
              href={`/login?next=/invite/${token}`}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition"
            >
              <UserPlus className="w-4 h-4" />
              Sign in to accept
            </Link>
            <p className="text-center text-xs text-slate-600 mt-3">
              You&apos;ll be added automatically after signing in.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorPage({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-h-screen bg-[#0b0b10] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#14141f] border border-white/10 rounded-2xl p-6 text-center shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h1 className="text-lg font-bold text-white mb-2">{title}</h1>
        <p className="text-sm text-slate-400 mb-5">{message}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold rounded-xl transition"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
