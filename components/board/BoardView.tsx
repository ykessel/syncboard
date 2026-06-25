'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import { reorderColumns } from '@/actions/columns'
import { reorderCards } from '@/actions/cards'
import BoardHeader from './BoardHeader'
import Column from './Column'
import CardItem from './Card'
import AddColumn from './AddColumn'
import type { Board, Column as ColumnType, Card, PresenceUser } from '@/types'

interface BoardViewProps {
  board: Board
  initialColumns: ColumnType[]
  currentUserId: string
}

export default function BoardView({ board, initialColumns, currentUserId }: BoardViewProps) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns)
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)
  const [presence, setPresence] = useState<PresenceUser[]>([])

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ── Realtime subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`board:${board.id}`)
      // Cards changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards', filter: `board_id=eq.${board.id}` },
        (payload) => {
          setColumns(prev => {
            if (payload.eventType === 'INSERT') {
              const card = payload.new as Card
              return prev.map(col =>
                col.id === card.column_id
                  ? { ...col, cards: [...(col.cards ?? []), card].sort((a, b) => a.position - b.position) }
                  : col
              )
            }
            if (payload.eventType === 'UPDATE') {
              const card = payload.new as Card
              return prev.map(col => ({
                ...col,
                cards: (col.cards ?? [])
                  .filter(c => c.id !== card.id)
                  .concat(col.id === card.column_id ? [card] : [])
                  .sort((a, b) => a.position - b.position),
              }))
            }
            if (payload.eventType === 'DELETE') {
              const id = (payload.old as Card).id
              return prev.map(col => ({
                ...col,
                cards: (col.cards ?? []).filter(c => c.id !== id),
              }))
            }
            return prev
          })
        }
      )
      // Column changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'columns', filter: `board_id=eq.${board.id}` },
        (payload) => {
          setColumns(prev => {
            if (payload.eventType === 'INSERT') {
              const col = { ...(payload.new as ColumnType), cards: [] }
              return [...prev, col].sort((a, b) => a.position - b.position)
            }
            if (payload.eventType === 'UPDATE') {
              return prev
                .map(col => col.id === payload.new.id ? { ...col, ...payload.new } : col)
                .sort((a, b) => a.position - b.position)
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter(col => col.id !== payload.old.id)
            }
            return prev
          })
        }
      )
      // Presence
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users = Object.values(state).flat()
        setPresence(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [board.id, currentUserId])

  // ── Drag helpers ────────────────────────────────────────────────────────
  function findCard(cardId: string): Card | null {
    for (const col of columns) {
      const card = col.cards?.find(c => c.id === cardId)
      if (card) return card
    }
    return null
  }

  function findCardColumn(cardId: string): string | null {
    for (const col of columns) {
      if (col.cards?.some(c => c.id === cardId)) return col.id
    }
    return null
  }

  function onDragStart({ active }: DragStartEvent) {
    const data = active.data.current
    if (data?.type === 'card') {
      setActiveCard(findCard(active.id as string))
    } else if (data?.type === 'column') {
      setActiveColumnId(active.id as string)
    }
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeType = active.data.current?.type
    const overType = over.data.current?.type
    if (activeType !== 'card') return

    const activeColId = findCardColumn(active.id as string)
    const overColId = overType === 'card'
      ? findCardColumn(over.id as string)
      : over.id as string // dropping on column

    if (!activeColId || !overColId || activeColId === overColId) return

    // Move card to new column (optimistic)
    setColumns(prev => {
      const sourceCol = prev.find(c => c.id === activeColId)
      const destCol = prev.find(c => c.id === overColId)
      if (!sourceCol || !destCol) return prev

      const card = sourceCol.cards?.find(c => c.id === active.id)
      if (!card) return prev

      return prev.map(col => {
        if (col.id === activeColId) {
          return { ...col, cards: (col.cards ?? []).filter(c => c.id !== card.id) }
        }
        if (col.id === overColId) {
          return { ...col, cards: [...(col.cards ?? []), { ...card, column_id: overColId }] }
        }
        return col
      })
    })
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null)
    setActiveColumnId(null)
    if (!over) return

    const activeType = active.data.current?.type

    if (activeType === 'column') {
      const oldIndex = columns.findIndex(c => c.id === active.id)
      const newIndex = columns.findIndex(c => c.id === over.id)
      if (oldIndex === newIndex) return

      const reordered = arrayMove(columns, oldIndex, newIndex).map((col, i) => ({
        ...col,
        position: i,
      }))
      setColumns(reordered)
      reorderColumns(board.id, reordered.map(c => ({ id: c.id, position: c.position })))
      return
    }

    if (activeType === 'card') {
      const overType = over.data.current?.type
      const targetColId = overType === 'card' ? findCardColumn(over.id as string) : over.id as string
      if (!targetColId) return

      setColumns(prev => {
        const targetCol = prev.find(c => c.id === targetColId)
        if (!targetCol) return prev

        const cards = targetCol.cards ?? []
        const activeIdx = cards.findIndex(c => c.id === active.id)
        const overIdx = overType === 'card' ? cards.findIndex(c => c.id === over.id) : cards.length

        const reordered = arrayMove(cards, activeIdx, overIdx).map((c, i) => ({
          ...c,
          position: i,
          column_id: targetColId,
        }))

        const updates = reordered.map(c => ({ id: c.id, column_id: c.column_id, position: c.position }))
        reorderCards(updates)

        return prev.map(col =>
          col.id === targetColId ? { ...col, cards: reordered } : col
        )
      })
    }
  }

  const updateCardLocal = useCallback((cardId: string, updates: Partial<Card>) => {
    setColumns(prev =>
      prev.map(col => ({
        ...col,
        cards: (col.cards ?? []).map(c => c.id === cardId ? { ...c, ...updates } : c),
      }))
    )
  }, [])

  const removeColumnLocal = useCallback((columnId: string) => {
    setColumns(prev => prev.filter(c => c.id !== columnId))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <BoardHeader board={board} presence={presence} />

      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={columns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-3 p-4 h-full overflow-x-auto items-start">
              {columns.map(col => (
                <Column
                  key={col.id}
                  column={col}
                  boardId={board.id}
                  currentUserId={currentUserId}
                  onUpdateCard={updateCardLocal}
                  onRemoveColumn={removeColumnLocal}
                />
              ))}
              <AddColumn boardId={board.id} />
            </div>
          </SortableContext>

          {/* Drag overlay */}
          <DragOverlay>
            {activeCard && (
              <div className="rotate-2 opacity-90">
                <CardItem card={activeCard} isDragging />
              </div>
            )}
            {activeColumnId && (
              <div className="opacity-80">
                {(() => {
                  const col = columns.find(c => c.id === activeColumnId)
                  return col ? <Column column={col} boardId={board.id} currentUserId={currentUserId} overlay /> : null
                })()}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
