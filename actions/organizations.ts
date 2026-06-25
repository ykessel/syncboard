'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const orgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
})

// ── CRUD ──────────────────────────────────────────────────────

export async function createOrganization(data: { name: string; slug: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = orgSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'This slug is already taken' }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard?org=${org.slug}`)
}

export async function updateOrganization(id: string, data: { name?: string; slug?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('organizations')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteOrganization(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// ── Queries ───────────────────────────────────────────────────

export async function getMyOrganizations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('org_members')
    .select(`
      role,
      organization:organizations(
        id, name, slug, logo_url, plan, owner_id, created_at, updated_at
      )
    `)
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })

  return (data ?? []).map(row => ({
    ...(row.organization as any),
    my_role: row.role,
  }))
}

export async function getOrganization(slug: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('organizations')
    .select(`*, org_members(count)`)
    .eq('slug', slug)
    .single()

  return data
}

// ── Members ───────────────────────────────────────────────────

export async function getOrgMembers(orgId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('org_members')
    .select(`
      org_id, user_id, role, joined_at,
      profile:profiles(id, name, avatar_url)
    `)
    .eq('org_id', orgId)
    .order('joined_at', { ascending: true })

  return data ?? []
}

export async function changeOrgMemberRole(orgId: string, userId: string, role: 'admin' | 'member') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('org_members')
    .update({ role })
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function removeOrgMember(orgId: string, userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Can't remove the owner
  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', orgId)
    .single()

  if (org?.owner_id === userId) return { error: 'Cannot remove the org owner' }

  const { error } = await supabase
    .from('org_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', userId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

export async function leaveOrganization(orgId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: org } = await supabase
    .from('organizations')
    .select('owner_id')
    .eq('id', orgId)
    .single()

  if (org?.owner_id === user.id) return { error: 'Org owner cannot leave — transfer ownership first' }

  const { error } = await supabase
    .from('org_members')
    .delete()
    .eq('org_id', orgId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  redirect('/dashboard')
}
