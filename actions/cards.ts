'use server'

import { createClient } from '@/lib/supabase/server'
import { CardLabel } from '@/types'

export async function createCard(columnId: string, boardId: string, title: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get current max position in column
  const { data: cards } = await supabase
    .from('cards')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = cards && cards.length > 0 ? cards[0].position + 1 : 0

  const { data, error } = await supabase
    .from('cards')
    .insert({
      column_id: columnId,
      board_id: boardId,
      title,
      position: nextPosition,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateCard(
  id: string,
  updates: {
    title?: string
    description?: string
    label?: CardLabel | null
    due_date?: string | null
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('cards')
    .update(updates)
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteCard(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function moveCard(
  cardId: string,
  newColumnId: string,
  newPosition: number,
  boardId: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('cards')
    .update({ column_id: newColumnId, position: newPosition })
    .eq('id', cardId)
    .eq('board_id', boardId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function reorderCards(updates: { id: string; column_id: string; position: number }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const promises = updates.map(({ id, column_id, position }) =>
    supabase.from('cards').update({ column_id, position }).eq('id', id)
  )

  await Promise.all(promises)
  return { success: true }
}
