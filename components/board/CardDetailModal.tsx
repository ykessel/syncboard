'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import {
  X, Tag, Calendar, Trash2, Check, Archive, ArchiveRestore,
  MessageSquare, Send, Pencil, Flag, UserCircle2, Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updateCard, deleteCard, archiveCard } from '@/actions/cards'
import { createComment, updateComment, deleteComment, getComments } from '@/actions/comments'
import type { Card, CardLabel, CardPriority, CardComment, BoardMember } from '@/types'

// ── Config ────────────────────────────────────────────────────

const LABEL_CONFIG: Record<CardLabel, { color: string; bg: string; label: string }> = {
  bug:         { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       label: 'Bug'         },
  feature:     { color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', label: 'Feature'     },
  improvement: { color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20',     label: 'Improvement' },
  design:      { color: 'text-pink-400',   bg: 'bg-pink-400/10 border-pink-400/20',     label: 'Design'      },
  docs:        { color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20',   label: 'Docs'        },
}

const PRIORITY_CONFIG: Record<CardPriority, { color: string; bg: string; dot: string; label: string }> = {
  urgent: { color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/20',       dot: 'bg-red-400',    label: 'Urgent' },
  high:   { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', dot: 'bg-orange-400', label: 'High'   },
  medium: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400', label: 'Medium' },
  low:    { color: 'text-slate-400',  bg: 'bg-slate-400/10 border-slate-400/20',   dot: 'bg-slate-400',  label: 'Low'    },
}

const ALL_LABELS: CardLabel[]    = ['bug', 'feature', 'improvement', 'design', 'docs']
const ALL_PRIORITIES: CardPriority[] = ['urgent', 'high', 'medium', 'low']

// ── Avatar helper ─────────────────────────────────────────────
function Avatar({ name, url, size = 6 }: { name: string | null; url: string | null; size?: number }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-semibold`
  if (url) return <img src={url} alt={name ?? ''} className={`${cls} object-cover`} />
  return <div className={`${cls} bg-indigo-500/30 border border-indigo-500/40 text-indigo-300`}>{initials}</div>
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000
  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

// ── Props ─────────────────────────────────────────────────────
interface CardDetailModalProps {
  card: Card
  boardMembers: BoardMember[]
  currentUserId: string
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Card>) => void
  onDelete: (id: string) => void
}

// ── Component ─────────────────────────────────────────────────
export default function CardDetailModal({
  card: initialCard, boardMembers, currentUserId, onClose, onUpdate, onDelete,
}: CardDetailModalProps) {
  const [card, setCard]             = useState(initialCard)
  const [editingTitle, setEditing]  = useState(false)
  const [titleVal, setTitleVal]     = useState(card.title)
  const [descVal, setDescVal]       = useState(card.description ?? '')
  const [comments, setComments]     = useState<CardComment[]>([])
  const [commentText, setCommentText] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editCommentVal, setEditCommentVal] = useState('')
  const [loadingComments, setLoadingComments] = useState(true)
  const [isPending, start]          = useTransition()
  const commentEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Load + subscribe to comments
  useEffect(() => {
    getComments(card.id).then(data => {
      setComments(data as CardComment[])
      setLoadingComments(false)
    })

    const channel = supabase
      .channel(`card-comments-${card.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'card_comments',
        filter: `card_id=eq.${card.id}`,
      }, async () => {
        // Reload comments on any change
        const data = await getComments(card.id)
        setComments(data as CardComment[])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [card.id])

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  // ── Patch helper ──────────────────────────────────────────
  function patch(updates: Partial<Card>) {
    setCard(c => ({ ...c, ...updates }))
    onUpdate(card.id, updates)
    start(async () => { await updateCard(card.id, updates as any) })
  }

  function saveTitle() {
    if (!titleVal.trim() || titleVal === card.title) { setTitleVal(card.title); setEditing(false); return }
    patch({ title: titleVal.trim() })
    setEditing(false)
  }

  function saveDesc() {
    if (descVal === (card.description ?? '')) return
    patch({ description: descVal || null })
  }

  async function handleAddComment() {
    if (!commentText.trim()) return
    const text = commentText.trim()
    setCommentText('')
    const result = await createComment(card.id, card.board_id, text)
    if (result?.data) {
      setComments(prev => [...prev, result.data as CardComment])
    }
  }

  async function handleUpdateComment(id: string) {
    if (!editCommentVal.trim()) return
    await updateComment(id, editCommentVal)
    setComments(prev => prev.map(c => c.id === id ? { ...c, content: editCommentVal } : c))
    setEditingComment(null)
  }

  async function handleDeleteComment(id: string) {
    await deleteComment(id)
    setComments(prev => prev.filter(c => c.id !== id))
  }

  async function handleDelete() {
    await deleteCard(card.id)
    onDelete(card.id)
    onClose()
  }

  async function handleArchive() {
    const newVal = !card.archived
    await archiveCard(card.id, newVal)
    patch({ archived: newVal })
    if (newVal) onClose()
  }

  const assignee = boardMembers.find(m => m.user_id === card.assignee_id)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#14141f] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-white/8 flex-shrink-0">
          <div className="flex-1 min-w-0">
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={titleVal}
                  onChange={e => setTitleVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setTitleVal(card.title); setEditing(false) } }}
                  className="flex-1 bg-[#1c1c2e] text-white text-sm font-semibold px-2 py-1.5 rounded-lg border border-indigo-500 outline-none"
                />
                <button onClick={saveTitle} className="text-green-400 p-1 hover:bg-green-400/10 rounded"><Check className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setTitleVal(card.title); setEditing(false) }} className="text-slate-400 p-1 hover:bg-white/5 rounded"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <h3
                onClick={() => setEditing(true)}
                className="text-sm font-semibold text-white cursor-text hover:text-indigo-300 transition flex items-center gap-1.5 group"
              >
                {card.title}
                <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition" />
              </h3>
            )}
            {card.archived && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded px-1.5 py-0.5 mt-1">
                <Archive className="w-2.5 h-2.5" /> Archived
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 grid sm:grid-cols-[1fr_160px] gap-6">

            {/* Left column */}
            <div className="space-y-5 min-w-0">

              {/* Description */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5">Description</p>
                <textarea
                  rows={4}
                  value={descVal}
                  onChange={e => setDescVal(e.target.value)}
                  onBlur={saveDesc}
                  placeholder="Add a description…"
                  className="w-full bg-[#1c1c2e] border border-white/10 text-white placeholder-slate-600 text-xs px-3 py-2.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition"
                />
              </div>

              {/* Comments */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3 h-3" />
                  Comments {comments.length > 0 && <span className="text-slate-600">({comments.length})</span>}
                </p>

                {loadingComments ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-slate-500" /></div>
                ) : (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {comments.map(c => {
                      const isAuthor = c.user_id === currentUserId
                      const isEditing = editingComment === c.id
                      return (
                        <div key={c.id} className="flex gap-2.5">
                          <Avatar name={(c.author as any)?.name ?? null} url={(c.author as any)?.avatar_url ?? null} size={6} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-xs font-medium text-slate-200">{(c.author as any)?.name ?? 'User'}</span>
                              <span className="text-[10px] text-slate-600">{formatTime(c.created_at)}</span>
                            </div>
                            {isEditing ? (
                              <div className="flex gap-1.5">
                                <input
                                  autoFocus
                                  value={editCommentVal}
                                  onChange={e => setEditCommentVal(e.target.value)}
                                  onKeyDown={e => { if (e.key === 'Enter') handleUpdateComment(c.id); if (e.key === 'Escape') setEditingComment(null) }}
                                  className="flex-1 bg-[#1c1c2e] border border-indigo-500 text-white text-xs px-2.5 py-1.5 rounded-lg outline-none"
                                />
                                <button onClick={() => handleUpdateComment(c.id)} className="text-green-400 p-1"><Check className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setEditingComment(null)} className="text-slate-400 p-1"><X className="w-3.5 h-3.5" /></button>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-300 break-words">{c.content}</p>
                            )}
                            {isAuthor && !isEditing && (
                              <div className="flex gap-2 mt-0.5">
                                <button
                                  onClick={() => { setEditingComment(c.id); setEditCommentVal(c.content) }}
                                  className="text-[10px] text-slate-600 hover:text-slate-400 transition"
                                >Edit</button>
                                <button
                                  onClick={() => handleDeleteComment(c.id)}
                                  className="text-[10px] text-slate-600 hover:text-red-400 transition"
                                >Delete</button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                    <div ref={commentEndRef} />
                  </div>
                )}

                {/* New comment */}
                <div className="flex gap-2 mt-3">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment() } }}
                    placeholder="Write a comment…"
                    className="flex-1 bg-[#1c1c2e] border border-white/10 text-white placeholder-slate-600 text-xs px-3 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="p-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-30 hover:bg-indigo-500/10 rounded-lg transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">

              {/* Assignee */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><UserCircle2 className="w-3 h-3" /> Assignee</p>
                <select
                  value={card.assignee_id ?? ''}
                  onChange={e => patch({ assignee_id: e.target.value || null })}
                  className="w-full bg-[#1c1c2e] border border-white/10 text-white text-xs px-2.5 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                >
                  <option value="">Unassigned</option>
                  {boardMembers.map(m => (
                    <option key={m.user_id} value={m.user_id}>
                      {(m.profile as any)?.name ?? m.user_id.slice(0,8)}
                    </option>
                  ))}
                </select>
                {assignee && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Avatar name={(assignee.profile as any)?.name ?? null} url={(assignee.profile as any)?.avatar_url ?? null} size={5} />
                    <span className="text-[11px] text-slate-400">{(assignee.profile as any)?.name}</span>
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Flag className="w-3 h-3" /> Priority</p>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => patch({ priority: null })}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition ${!card.priority ? 'bg-white/8 border-white/15 text-white' : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-700 flex-shrink-0" />
                    None
                  </button>
                  {ALL_PRIORITIES.map(p => {
                    const cfg = PRIORITY_CONFIG[p]
                    const active = card.priority === p
                    return (
                      <button
                        key={p}
                        onClick={() => patch({ priority: active ? null : p })}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border transition ${active ? `${cfg.bg} ${cfg.color}` : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-white'}`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Label */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Label</p>
                <div className="flex flex-col gap-1">
                  {ALL_LABELS.map(l => {
                    const cfg = LABEL_CONFIG[l]
                    const active = card.label === l
                    return (
                      <button
                        key={l}
                        onClick={() => patch({ label: active ? null : l })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition ${active ? `${cfg.bg} ${cfg.color}` : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-white'}`}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Due date */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due date</p>
                <input
                  type="date"
                  defaultValue={card.due_date ?? ''}
                  onChange={e => patch({ due_date: e.target.value || null })}
                  className="w-full bg-[#1c1c2e] border border-white/10 text-white text-xs px-2.5 py-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
                />
              </div>

              {/* Actions */}
              <div className="space-y-1 pt-1 border-t border-white/8">
                <button
                  onClick={handleArchive}
                  disabled={isPending}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-400 hover:text-amber-400 hover:bg-amber-400/5 border border-transparent hover:border-amber-400/20 rounded-lg transition"
                >
                  {card.archived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  {card.archived ? 'Restore' : 'Archive'}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-400/5 border border-transparent hover:border-red-400/20 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
