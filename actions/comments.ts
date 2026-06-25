'use server'

import { createClient } from '@/lib/supabase/server'

export async function createComment(cardId: string, boardId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (!content.trim()) return { error: 'Comment cannot be empty' }

  const { data, error } = await supabase
    .from('card_comments')
    .insert({ card_id: cardId, board_id: boardId, user_id: user.id, content: content.trim() })
    .select(`*, author:profiles!user_id(id, name, avatar_url)`)
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateComment(commentId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('card_comments')
    .update({ content: content.trim() })
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('card_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function getComments(cardId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('card_comments')
    .select(`*, author:profiles!user_id(id, name, avatar_url)`)
    .eq('card_id', cardId)
    .order('created_at', { ascending: true })

  return data ?? []
}
