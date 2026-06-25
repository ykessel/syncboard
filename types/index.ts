export type CardLabel    = 'bug' | 'feature' | 'improvement' | 'design' | 'docs'
export type CardPriority = 'urgent' | 'high' | 'medium' | 'low'
export type OrgRole      = 'owner' | 'admin' | 'member'
export type BoardRole    = 'owner' | 'member'
export type InviteType   = 'org' | 'board'

// ── Profiles ──────────────────────────────────────────────────
export interface Profile {
  id: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

// ── Organizations ─────────────────────────────────────────────
export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  owner_id: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
  // joined
  member_count?: number
  my_role?: OrgRole
}

export interface OrgMember {
  org_id: string
  user_id: string
  role: OrgRole
  joined_at: string
  profile?: Profile
}

// ── Boards ────────────────────────────────────────────────────
export interface Board {
  id: string
  title: string
  description: string | null
  color: string
  owner_id: string
  org_id: string | null
  created_at: string
  updated_at: string
  // joined
  owner?: Profile
  member_count?: number
  column_count?: number
}

export interface BoardMember {
  board_id: string
  user_id: string
  role: BoardRole
  joined_at: string
  profile?: Profile
}

// ── Columns ───────────────────────────────────────────────────
export interface Column {
  id: string
  board_id: string
  title: string
  position: number
  color: string | null
  created_at: string
  cards?: Card[]
}

// ── Cards ─────────────────────────────────────────────────────
export interface Card {
  id: string
  column_id: string
  board_id: string
  title: string
  description: string | null
  position: number
  label: CardLabel | null
  priority: CardPriority | null
  due_date: string | null
  assignee_id: string | null
  archived: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // joined
  creator?: Profile
  assignee?: Profile
}

// ── Comments ──────────────────────────────────────────────────
export interface CardComment {
  id: string
  card_id: string
  board_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  // joined
  author?: Profile
}

// ── Invitations ───────────────────────────────────────────────
export interface Invitation {
  id: string
  token: string
  type: InviteType
  org_id: string | null
  board_id: string | null
  role: OrgRole
  invited_by: string | null
  max_uses: number | null
  use_count: number
  expires_at: string
  created_at: string
  // joined
  inviter?: Profile
  org?: { name: string; slug: string }
  board?: { title: string; color: string }
}

// ── Presence ──────────────────────────────────────────────────
export interface PresenceUser {
  user_id: string
  name: string | null
  avatar_url: string | null
  online_at: string
}

// ── Drag & Drop ───────────────────────────────────────────────
export type DragType = 'column' | 'card'
export interface DragData {
  type: DragType
  id: string
  columnId?: string
}
