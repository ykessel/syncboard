'use client'

import { useState, useTransition } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, Tag, Trash2, X, Check } from 'lucide-react'
import { updateCard, deleteCard } from '@/actions/cards'
import type { Card, CardLabel } from '@/types'

const LABEL_CONFIG: Record<CardLabel, { color: string; bg: string; label: string }> = {
  bug:         { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',     label: 'Bug' },
  feature:     { color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20', label: 'Feature' },
  improvement: { color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',   label: 'Improvement' },
  design:      { color: 'text-pink-400',   bg: 'bg-pink-400/10 border-pink-400/20',   label: 'Design' },
  docs:        { color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20', label: 'Docs' },
}

const ALL_LABELS: CardLabel[] = ['bug', 'feature', 'improvement', 'design', 'docs']

interface CardItemProps {
  card: Card
  isDragging?: boolean
  onUpdate?: (cardId: string, updates: Partial<Card>) => void
}

export default function CardItem({ card, isDragging, onUpdate }: CardItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(card.title)
  const [descValue, setDescValue] = useState(card.description ?? '')
  const [isPending, startTransition] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
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

  const labelConfig = card.label ? LABEL_CONFIG[card.label] : null

  function saveTitle() {
    if (!titleValue.trim() || titleValue === card.title) {
      setTitleValue(card.title)
      setEditingTitle(false)
      return
    }
    startTransition(async () => {
      await updateCard(card.id, { title: titleValue.trim() })
      onUpdate?.(card.id, { title: titleValue.trim() })
      setEditingTitle(false)
    })
  }

  function saveDesc() {
    startTransition(async () => {
      await updateCard(card.id, { description: descValue || undefined })
      onUpdate?.(card.id, { description: descValue || undefined })
    })
  }

  function setLabel(label: CardLabel | null) {
    startTransition(async () => {
      await updateCard(card.id, { label })
      onUpdate?.(card.id, { label })
    })
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteCard(card.id)
      onUpdate?.(card.id, { title: '' }) // triggers removal via realtime
    })
  }

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
        {/* Label badge */}
        {labelConfig && (
          <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border mb-1.5 ${labelConfig.bg} ${labelConfig.color}`}>
            {labelConfig.label}
          </div>
        )}

        <p className="text-xs text-slate-200 leading-relaxed">{card.title}</p>

        {/* Footer meta */}
        {(card.due_date || card.description) && (
          <div className="flex items-center gap-2 mt-2">
            {card.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar className="w-3 h-3" />
                {new Date(card.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {card.description && (
              <span className="text-[10px] text-slate-500 truncate">{card.description.slice(0, 30)}{card.description.length > 30 ? '…' : ''}</span>
            )}
          </div>
        )}
      </div>

      {/* Card detail modal */}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setExpanded(false) }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setExpanded(false)} />

          <div className="relative bg-[#14141f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-start gap-3 p-5 border-b border-white/8">
              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={titleValue}
                      onChange={e => setTitleValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleValue(card.title); setEditingTitle(false) } }}
                      className="flex-1 bg-[#1c1c2e] text-white text-sm font-semibold px-2 py-1 rounded border border-indigo-500 outline-none"
                    />
                    <button onClick={saveTitle} className="text-green-400 p-1"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { setTitleValue(card.title); setEditingTitle(false) }} className="text-slate-400 p-1"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <h3
                    className="text-sm font-semibold text-white cursor-text hover:text-indigo-300 transition"
                    onDoubleClick={() => setEditingTitle(true)}
                    title="Double-click to edit"
                  >
                    {card.title}
                  </h3>
                )}
              </div>
              <button onClick={() => setExpanded(false)} className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5 flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Labels */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Label
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_LABELS.map(l => {
                    const cfg = LABEL_CONFIG[l]
                    const isActive = card.label === l
                    return (
                      <button
                        key={l}
                        onClick={() => setLabel(isActive ? null : l)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                          isActive
                            ? `${cfg.bg} ${cfg.color} ring-1 ring-current`
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Due date */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Due date
                </p>
                <input
                  type="date"
                  defaultValue={card.due_date ?? ''}
                  onChange={e => {
                    const val = e.target.value || null
                    startTransition(async () => {
                      await updateCard(card.id, { due_date: val })
                      onUpdate?.(card.id, { due_date: val })
                    })
                  }}
                  className="bg-[#1c1c2e] border border-white/10 text-white text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                />
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2">Description</p>
                <textarea
                  rows={4}
                  value={descValue}
                  onChange={e => setDescValue(e.target.value)}
                  onBlur={saveDesc}
                  placeholder="Add a description…"
                  className="w-full bg-[#1c1c2e] border border-white/10 text-white placeholder-slate-600 text-xs px-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition"
                />
              </div>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition px-3 py-2 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete card
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
