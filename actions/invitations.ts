'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ── Create invite link ────────────────────────────────────────

export async function createOrgInvite(orgId: string, role: 'admin' | 'member' = 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      type: 'org',
      org_id: orgId,
      role,
      invited_by: user.id,
    })
    .select('token')
    .single()

  if (error) return { error: error.message }
  return { token: data.token }
}

export async function createBoardInvite(boardId: string, role: 'member' = 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      type: 'board',
      board_id: boardId,
      role,
      invited_by: user.id,
    })
    .select('token')
    .single()

  if (error) return { error: error.message }
  return { token: data.token }
}

// ── Get invites ───────────────────────────────────────────────

export async function getOrgInvites(orgId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('invitations')
    .select(`
      id, token, role, use_count, max_uses, expires_at, created_at,
      inviter:profiles!invited_by(id, name, avatar_url)
    `)
    .eq('org_id', orgId)
    .eq('type', 'org')
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getBoardInvites(boardId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('invitations')
    .select(`
      id, token, role, use_count, max_uses, expires_at, created_at,
      inviter:profiles!invited_by(id, name, avatar_url)
    `)
    .eq('board_id', boardId)
    .eq('type', 'board')
    .order('created_at', { ascending: false })

  return data ?? []
}

// ── Revoke invite ─────────────────────────────────────────────

export async function revokeInvite(inviteId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', inviteId)
    .eq('invited_by', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

// ── Accept invite (called from /invite/[token] page) ──────────

export async function acceptInvite(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated' }

  // Fetch the invitation
  const { data: invite, error: inviteError } = await supabase
    .from('invitations')
    .select(`
      *,
      org:organizations(id, name, slug),
      board:boards(id, title, color)
    `)
    .eq('token', token)
    .single()

  if (inviteError || !invite) return { error: 'invalid_token' }

  // Check expiry
  if (new Date(invite.expires_at) < new Date()) return { error: 'expired' }

  // Check max_uses
  if (invite.max_uses !== null && invite.use_count >= invite.max_uses) {
    return { error: 'max_uses_reached' }
  }

  if (invite.type === 'org' && invite.org_id) {
    // Check if already a member
    const { data: existing } = await supabase
      .from('org_members')
      .select('user_id')
      .eq('org_id', invite.org_id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      const { error: insertError } = await supabase
        .from('org_members')
        .insert({ org_id: invite.org_id, user_id: user.id, role: invite.role })

      if (insertError) return { error: insertError.message }
    }

    // Increment use_count
    await supabase
      .from('invitations')
      .update({ use_count: invite.use_count + 1 })
      .eq('id', invite.id)

    redirect(`/dashboard?org=${(invite.org as any).slug}`)
  }

  if (invite.type === 'board' && invite.board_id) {
    // Check if already a member
    const { data: existing } = await supabase
      .from('board_members')
      .select('user_id')
      .eq('board_id', invite.board_id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      const { error: insertError } = await supabase
        .from('board_members')
        .insert({ board_id: invite.board_id, user_id: user.id, role: 'member' })

      if (insertError) return { error: insertError.message }
    }

    await supabase
      .from('invitations')
      .update({ use_count: invite.use_count + 1 })
      .eq('id', invite.id)

    redirect(`/board/${invite.board_id}`)
  }

  return { error: 'invalid_invite_type' }
}

// ── Lookup token info (for preview page) ─────────────────────

export async function getInviteByToken(token: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('invitations')
    .select(`
      id, type, role, expires_at, use_count, max_uses,
      org:organizations(id, name, slug, logo_url),
      board:boards(id, title, color),
      inviter:profiles!invited_by(id, name, avatar_url)
    `)
    .eq('token', token)
    .single()

  return data
}
