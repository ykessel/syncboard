'use client'

import { useState, useTransition } from 'react'
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreHorizontal, Trash2, GripVertical, Check, X } from 'lucide-react'
import { deleteColumn, updateColumn } from '@/actions/columns'
import CardItem from './Card'
import AddCard from './AddCard'
import type { Column as ColumnType, Card, BoardMember } from '@/types'

interface ColumnProps {
  column: ColumnType
  boardId: string
  currentUserId: string
  boardMembers: BoardMember[]
  overlay?: boolean
  onUpdateCard?: (cardId: string, updates: Partial<Card>) => void
  onRemoveCard?: (cardId: string) => void
  onRemoveColumn?: (columnId: string) => void
}

const COLUMN_COLORS = [
  { label: 'Default', value: null },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Red', value: '#ef4444' },
]

export default function Column({ column, boardId, currentUserId, boardMembers, overlay, onUpdateCard, onRemoveCard, onRemoveColumn }: ColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(column.title)
  const [isPending, startTransition] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: 'column' },
    disabled: overlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const accentColor = column.color ?? '#6366f1'
  const cards = column.cards ?? []

  function saveTitle() {
    if (!titleValue.trim() || titleValue === column.title) {
      setTitleValue(column.title)
      setEditingTitle(false)
      return
    }
    startTransition(async () => {
      await updateColumn(column.id, { title: titleValue.trim() })
      setEditingTitle(false)
    })
  }

  function handleDelete() {
    setMenuOpen(false)
    startTransition(async () => {
      await deleteColumn(column.id, boardId)
      onRemoveColumn?.(column.id)
    })
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-64 flex flex-col bg-[#14141f] border border-white/8 rounded-xl overflow-hidden"
    >
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b border-white/8"
        style={{ borderTop: `2px solid ${accentColor}` }}
      >
        {/* Drag handle */}
        {!overlay && (
          <button
            {...attributes}
            {...listeners}
            className="text-slate-600 hover:text-slate-400 transition cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Title */}
        {editingTitle ? (
          <div className="flex-1 flex items-center gap-1">
            <input
              autoFocus
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleValue(column.title); setEditingTitle(false) } }}
              className="flex-1 bg-[#1c1c2e] text-white text-xs font-semibold px-2 py-1 rounded border border-indigo-500 outline-none min-w-0"
            />
            <button onClick={saveTitle} className="text-green-400 hover:text-green-300 p-0.5"><Check className="w-3 h-3" /></button>
            <button onClick={() => { setTitleValue(column.title); setEditingTitle(false) }} className="text-slate-400 hover:text-white p-0.5"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <button
            className="flex-1 text-left text-xs font-semibold text-slate-200 truncate hover:text-white transition"
            onDoubleClick={() => !overlay && setEditingTitle(true)}
          >
            {column.title}
          </button>
        )}

        <span className="text-xs text-slate-500 flex-shrink-0">{cards.length}</span>

        {/* Menu */}
        {!overlay && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-500 hover:text-white transition p-1 rounded hover:bg-white/5"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-[#1c1c2e] border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]">
                <button
                  onClick={() => { setMenuOpen(false); setEditingTitle(true) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 transition"
                >
                  Rename column
                </button>
                <hr className="border-white/8 my-1" />
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete column
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[40px]">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map(card => (
            <CardItem
              key={card.id}
              card={card}
              boardMembers={boardMembers}
              currentUserId={currentUserId}
              onUpdate={onUpdateCard}
              onDelete={onRemoveCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add card */}
      {!overlay && (
        <div className="p-2 border-t border-white/5">
          <AddCard columnId={column.id} boardId={boardId} currentUserId={currentUserId} />
        </div>
      )}
    </div>
  )
}
