import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Layout, Users, Building2 } from 'lucide-react'
import CreateBoardModal from '@/components/dashboard/CreateBoardModal'
import { getOrganization, getOrgMembers } from '@/actions/organizations'

const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#f97316',
]

interface Props {
  searchParams: Promise<{ org?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const { org: orgSlug } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Resolve org context
  let orgId: string | null = null
  let orgData: any = null
  if (orgSlug) {
    orgData = await getOrganization(orgSlug)
    orgId = orgData?.id ?? null
  }

  // Fetch boards — scoped by workspace
  const query = supabase
    .from('boards')
    .select(`*, board_members(count), columns(count)`)
    .order('updated_at', { ascending: false })

  const { data: boards } = orgId
    ? await query.eq('org_id', orgId)
    : await query.is('org_id', null)

  // Org members (for header stat)
  const orgMembers = orgId ? await getOrgMembers(orgId) : []

  const title = orgData ? orgData.name : 'Personal'
  const subtitle = orgData
    ? `${orgMembers.length} member${orgMembers.length !== 1 ? 's' : ''} · ${boards?.length ?? 0} board${boards?.length !== 1 ? 's' : ''}`
    : `${boards?.length ?? 0} board${boards?.length !== 1 ? 's' : ''}`

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {orgData ? (
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
          ) : null}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <CreateBoardModal colors={BOARD_COLORS} orgId={orgId ?? undefined} />
      </div>

      {/* Org members strip */}
      {orgData && orgMembers.length > 0 && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-white/3 border border-white/8 rounded-xl">
          <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="flex -space-x-2">
            {orgMembers.slice(0, 8).map((m: any) => (
              m.profile?.avatar_url ? (
                <img
                  key={m.user_id}
                  src={m.profile.avatar_url}
                  alt={m.profile.name ?? ''}
                  className="w-7 h-7 rounded-full border-2 border-[#0d0d14] object-cover"
                  title={m.profile.name ?? ''}
                />
              ) : (
                <div
                  key={m.user_id}
                  className="w-7 h-7 rounded-full bg-indigo-500/30 border-2 border-[#0d0d14] flex items-center justify-center text-[10px] font-bold text-indigo-300"
                  title={m.profile?.name ?? ''}
                >
                  {(m.profile?.name ?? '?').slice(0,1).toUpperCase()}
                </div>
              )
            ))}
          </div>
          {orgMembers.length > 8 && (
            <span className="text-xs text-slate-500">+{orgMembers.length - 8} more</span>
          )}
          <span className="text-xs text-slate-500 ml-auto capitalize">
            {(orgMembers.find((m: any) => m.user_id === user?.id) as any)?.role ?? 'member'} in {orgData.name}
          </span>
        </div>
      )}

      {/* Boards grid */}
      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="group relative bg-[#14141f] border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-all hover:shadow-lg hover:shadow-black/30"
            >
              <div
                className="h-24 w-full flex items-end p-3"
                style={{
                  background: `linear-gradient(135deg, ${board.color}33 0%, ${board.color}11 100%)`,
                  borderBottom: `1px solid ${board.color}22`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${board.color}33`, border: `1px solid ${board.color}44` }}
                >
                  <Layout className="w-4 h-4" style={{ color: board.color }} />
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors truncate">
                  {board.title}
                </h3>
                {board.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{board.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-slate-500">
                    {(board.columns as any)?.[0]?.count ?? 0} columns
                  </span>
                  <span className="text-xs text-slate-500">
                    {(board.board_members as any)?.[0]?.count ?? 0} member{(board.board_members as any)?.[0]?.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          <CreateBoardModal colors={BOARD_COLORS} orgId={orgId ?? undefined} asCard />
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Layout className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No boards yet</h2>
          <p className="text-sm text-slate-400 mb-6">
            {orgData ? `Create the first board for ${orgData.name}.` : 'Create your first board to start collaborating.'}
          </p>
          <CreateBoardModal colors={BOARD_COLORS} orgId={orgId ?? undefined} />
        </div>
      )}
    </div>
  )
}
