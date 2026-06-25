import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Layout } from 'lucide-react'
import CreateBoardModal from '@/components/dashboard/CreateBoardModal'

const BOARD_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#f97316',
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: boards } = await supabase
    .from('boards')
    .select(`
      *,
      board_members(count),
      columns(count)
    `)
    .order('updated_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Boards</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {boards?.length ?? 0} board{boards?.length !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateBoardModal colors={BOARD_COLORS} />
      </div>

      {/* Boards grid */}
      {boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.id}`}
              className="group relative bg-[#14141f] border border-white/8 rounded-xl overflow-hidden hover:border-white/15 transition-all hover:shadow-lg hover:shadow-black/30"
            >
              {/* Color bar */}
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

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-sm group-hover:text-indigo-300 transition-colors truncate">
                  {board.title}
                </h3>
                {board.description && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{board.description}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs text-slate-500">
                    {board.columns?.[0]?.count ?? 0} columns
                  </span>
                  <span className="text-xs text-slate-500">
                    {board.board_members?.[0]?.count ?? 0} member{board.board_members?.[0]?.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Create new */}
          <CreateBoardModal colors={BOARD_COLORS} asCard />
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <Layout className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">No boards yet</h2>
          <p className="text-sm text-slate-400 mb-6">Create your first board to start collaborating.</p>
          <CreateBoardModal colors={BOARD_COLORS} />
        </div>
      )}
    </div>
  )
}
