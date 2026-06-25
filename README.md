# Syncboard

Real-time collaborative Kanban boards. Move a card and your whole team sees it happen — live cursors, presence indicators, and instant sync with no refresh required.

![Next.js](https://img.shields.io/badge/Next.js_16-black?logo=next.js) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## Features

- **Real-time sync** — all changes (card moves, edits, new columns) broadcast instantly to every connected user via Supabase Realtime
- **Live presence** — see who's online with avatar indicators in the board header, powered by Supabase Presence
- **Drag & drop** — smooth card and column reordering with dnd-kit; cross-column moves and optimistic UI updates
- **GitHub OAuth** — one-click sign-in, no passwords
- **Card detail** — labels (bug / feature / improvement / design / docs), due dates, description with auto-save
- **Board management** — create boards with custom colors, manage members, collapse/expand the sidebar
- **RLS enforced** — Row Level Security on every table; users only see boards they're members of

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Database & Auth | Supabase (PostgreSQL + Auth + Realtime) |
| Drag & Drop | dnd-kit |
| Animations | Framer Motion |
| Styling | Tailwind CSS |
| State | Zustand |
| Validation | Zod |
| Deployment | Vercel |

## Project Structure

```
Syncboard/
├── app/
│   ├── (app)/
│   │   ├── board/[id]/     # Board view
│   │   └── dashboard/      # Board list
│   ├── (auth)/
│   │   └── login/          # GitHub OAuth entry point
│   ├── auth/callback/      # OAuth code exchange
│   ├── layout.tsx
│   └── page.tsx            # Marketing landing
├── actions/
│   ├── auth.ts             # signOut server action
│   ├── boards.ts           # CRUD for boards
│   ├── columns.ts          # CRUD for columns
│   └── cards.ts            # CRUD for cards
├── components/
│   ├── board/
│   │   ├── BoardView.tsx   # DndContext + Realtime subscription
│   │   ├── BoardHeader.tsx # Title + presence avatars
│   │   ├── Column.tsx      # Sortable column + cards
│   │   ├── Card.tsx        # Sortable card + detail modal
│   │   ├── AddColumn.tsx
│   │   └── AddCard.tsx
│   ├── dashboard/
│   │   └── CreateBoardModal.tsx
│   └── layout/
│       └── Sidebar.tsx     # Collapsible sidebar
├── lib/
│   ├── schema.sql          # Full DB schema + RLS policies
│   └── supabase/
│       ├── client.ts       # Browser client
│       └── server.ts       # Server/RSC client
├── types/index.ts
├── proxy.ts                # Route protection (Next.js 16)
└── vercel.json
```

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/portfolio
cd portfolio/Syncboard
npm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 3. Run the database schema

In the Supabase dashboard, open **SQL Editor** and run the contents of `lib/schema.sql`. This creates all tables, triggers, RLS policies, and enables Realtime.

### 4. Enable GitHub OAuth

1. Go to **Authentication → Providers → GitHub** in the Supabase dashboard and enable it.
2. Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers):
   - **Homepage URL:** `https://your-project.supabase.co`
   - **Authorization callback URL:** `https://your-project.supabase.co/auth/v1/callback`
3. Copy the Client ID and Secret back into the Supabase GitHub provider settings.

### 5. Set environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Both values are in **Supabase → Project Settings → API**.

### 6. Run locally

```bash
npm run dev
# → http://localhost:3000
```

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set **Root Directory** to `Syncboard`.
3. Add the two environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
4. Add your Vercel deployment URL to the GitHub OAuth App's callback URL allowlist.
5. Deploy — `vercel.json` already includes `{ "framework": "nextjs" }` for monorepo detection.

## Database Schema

```
profiles        — extends auth.users (name, avatar_url)
boards          — title, description, color, owner_id
board_members   — board_id × user_id, role (owner | member)
columns         — board_id, title, position, color
cards           — column_id, board_id, title, description,
                  position, label, due_date, created_by
```

All tables have Row Level Security enabled. Access to columns and cards is gated through `board_members` — if you're not a member of the board, you can't read or write anything on it.

Realtime is published for `columns`, `cards`, and `board_members`.

## License

MIT
