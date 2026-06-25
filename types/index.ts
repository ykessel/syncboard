export type CardLabel = 'bug' | 'feature' | 'improvement' | 'design' | 'docs'

export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Board {
  id: string
  title: string
  description: string | null
  color: string
  owner_id: string
  created_at: string
  updated_at: string
  // Joined
  owner?: Profile
  member_count?: number
}

export interface BoardMember {
  board_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
  profile?: Profile
}

export interface Column {
  id: string
  board_id: string
  title: string
  position: number
  color: string | null
  created_at: string
  // Joined
  cards?: Card[]
}

export interface Card {
  id: string
  column_id: string
  board_id: string
  title: string
  description: string | null
  position: number
  label: CardLabel | null
  due_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  creator?: Profile
}

export interface PresenceUser {
  user_id: string
  name: string | null
  avatar_url: string | null
  online_at: string
}

// Drag & Drop types
export type DragType = 'column' | 'card'

export interface DragData {
  type: DragType
  id: string
  columnId?: string // for cards
}
