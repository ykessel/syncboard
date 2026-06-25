'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createColumn(boardId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current max position
  const { data: cols } = await supabase
    .from('columns')
    .select('position')
    .eq('board_id', boardId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = cols && cols.length > 0 ? cols[0].position + 1 : 0

  const { data, error } = await supabase
    .from('columns')
    .insert({ board_id: boardId, title, position: nextPosition })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateColumn(id: string, updates: { title?: string; color?: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('columns')
    .update(updates)
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteColumn(id: string, boardId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('columns')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/board/${boardId}`)
  return { success: true }
}

export async function reorderColumns(boardId: string, updates: { id: string; position: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Batch update positions
  const promises = updates.map(({ id, position }) =>
    supabase.from('columns').update({ position }).eq('id', id).eq('board_id', boardId)
  )

  await Promise.all(promises)
  return { success: true }
}

export async function getColumns(boardId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('columns')
    .select(`
      *,
      cards(*)
    `)
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  // Sort cards by position within each column
  return (data ?? []).map(col => ({
    ...col,
    cards: (col.cards ?? []).sort((a: { position: number }, b: { position: number }) => a.position - b.position),
  }))
}
