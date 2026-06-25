'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar } from 'lucide-react'
import CardDetailModal from './CardDetailModal'
import type { Card, CardLabel, CardPriority, BoardMember } from '@/types'

const LABEL_COLOR: Record<CardLabel, string> = {
  bug:         'bg-red-400/15 text-red-400',
  feature:     'bg-violet-400/15 text-violet-400',
  improvement: 'bg-blue-400/15 text-blue-400',
  design:      'bg-pink-400/15 text-pink-400',
  docs:        'bg-amber-400/15 text-amber-400',
}

const LABEL_LABEL: Record<CardLabel, string> = {
  bug: 'Bug', feature: 'Feature', improvement: 'Improvement', design: 'Design', docs: 'Docs',
}

const PRIORITY_DOT: Record<CardPriority, string> = {
  urgent: 'bg-red-400',
  high:   'bg-orange-400',
  medium: 'bg-yellow-400',
  low:    'bg-slate-500',
}

interface CardItemProps {
  card: Card
  boardMembers: BoardMember[]
  currentUserId: string
  isDragging?: boolean
  onUpdate?: (cardId: string, updates: Partial<Card>) => void
  onDelete?: (cardId: string) => void
}

export default function CardItem({
  card, boardMembers, currentUserId, isDragging, onUpdate, onDelete,
}: CardItemProps) {
  const [expanded, setExpanded] = useState(false)

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', columnId: card.column_id },
    disabled: !!isDragging,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  }

  const assignee   = boardMembers.find(m => m.user_id === card.assignee_id)
  const priorityDot = card.priority ? PRIORITY_DOT[card.priority] : null

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isDragging && setExpanded(true)}
        className={`group bg-[#1c1c2e] border border-white/5 rounded-lg px-3 py-2.5 cursor-pointer hover:border-white/12 hover:bg-[#212133] transition-all select-none ${
          isDragging ? 'shadow-xl border-indigo-500/30' : ''
        }`}
      >
        {/* Top row: label + priority dot */}
        {(card.label || card.priority) && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {card.label && (
              <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${LABEL_COLOR[card.label]}`}>
                {LABEL_LABEL[card.label]}
              </span>
            )}
            {priorityDot && (
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot}`} title={card.priority ?? ''} />
            )}
          </div>
        )}

        <p className="text-xs text-slate-200 leading-relaxed">{card.title}</p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex items-center gap-2">
            {card.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="w-2.5 h-2.5" />
                {new Date(card.due_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
              </span>
            )}
          </div>
          {/* Assignee avatar */}
          {assignee && (
            <div className="flex-shrink-0" title={(assignee.profile as any)?.name ?? 'Assignee'}>
              {(assignee.profile as any)?.avatar_url ? (
                <img
                  src={(assignee.profile as any).avatar_url}
                  alt={(assignee.profile as any).name ?? ''}
                  className="w-5 h-5 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500/40 flex items-center justify-center text-[8px] font-bold text-indigo-300">
                  {((assignee.profile as any)?.name ?? '?').slice(0,1).toUpperCase()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {expanded && (
        <CardDetailModal
          card={card}
          boardMembers={boardMembers}
          currentUserId={currentUserId}
          onClose={() => setExpanded(false)}
          onUpdate={(id, updates) => onUpdate?.(id, updates)}
          onDelete={(id) => { onDelete?.(id); setExpanded(false) }}
        />
      )}
    </>
  )
}
