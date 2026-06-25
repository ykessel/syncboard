import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBoard } from '@/actions/boards'
import { getColumns } from '@/actions/columns'
import BoardView from '@/components/board/BoardView'

interface BoardPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: BoardPageProps) {
  const { id } = await params
  const board = await getBoard(id)
  return { title: board ? `${board.title} — Syncboard` : 'Board' }
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const [board, columns] = await Promise.all([
    getBoard(id),
    getColumns(id),
  ])

  if (!board) notFound()

  // Fetch board members for assignee picker and card display
  const { data: boardMembers } = await supabase
    .from('board_members')
    .select('board_id, user_id, role, joined_at, profile:profiles(id, name, avatar_url)')
    .eq('board_id', id)

  return (
    <BoardView
      board={board}
      initialColumns={columns}
      currentUserId={user.id}
      boardMembers={(boardMembers ?? []) as any}
    />
  )
}
