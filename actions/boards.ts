'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const boardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#6366f1'),
})

export async function createBoard(data: { title: string; description?: string; color?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = boardSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { data: board, error } = await supabase
    .from('boards')
    .insert({ ...parsed.data, owner_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect(`/board/${board.id}`)
}

export async function updateBoard(id: string, data: { title?: string; description?: string; color?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('boards')
    .update(data)
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(`/board/${id}`)
  return { success: true }
}

export async function deleteBoard(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('boards')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function getBoards() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('boards')
    .select(`
      *,
      owner:profiles!owner_id(id, name, avatar_url),
      board_members(count)
    `)
    .order('updated_at', { ascending: false })

  return data ?? []
}

export async function getBoard(id: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('boards')
    .select(`
      *,
      owner:profiles!owner_id(id, name, avatar_url),
      board_members(user_id, role, profile:profiles(id, name, avatar_url))
    `)
    .eq('id', id)
    .single()

  return data
}
