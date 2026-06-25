-- ============================================================
-- Syncboard — Schema v2 Migration
-- Run this AFTER schema.sql in your Supabase SQL editor
-- ============================================================

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table if not exists organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  logo_url   text,
  owner_id   uuid references profiles(id) on delete cascade not null,
  plan       text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

drop trigger if exists organizations_updated_at on organizations;
create trigger organizations_updated_at
  before update on organizations
  for each row execute function set_updated_at();

-- Auto-add owner as org member
create or replace function add_owner_as_org_member()
returns trigger as $$
begin
  insert into org_members (org_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ORG MEMBERS
-- ============================================================
create table if not exists org_members (
  org_id    uuid references organizations(id) on delete cascade not null,
  user_id   uuid references profiles(id) on delete cascade not null,
  role      text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now() not null,
  primary key (org_id, user_id)
);

drop trigger if exists on_org_created on organizations;
create trigger on_org_created
  after insert on organizations
  for each row execute function add_owner_as_org_member();

-- ============================================================
-- BOARDS: add org_id (nullable = personal board)
-- ============================================================
alter table boards add column if not exists org_id uuid references organizations(id) on delete cascade;

-- ============================================================
-- CARDS: add assignee, priority, archived
-- ============================================================
alter table cards add column if not exists assignee_id uuid references profiles(id) on delete set null;
alter table cards add column if not exists priority text check (priority in ('urgent', 'high', 'medium', 'low'));
alter table cards add column if not exists archived boolean default false not null;

-- ============================================================
-- INVITATIONS
-- Covers both org-level and board-level invites
-- Uses a shareable token link — no email required
-- ============================================================
create table if not exists invitations (
  id          uuid primary key default gen_random_uuid(),
  token       uuid default gen_random_uuid() not null unique,
  type        text not null check (type in ('org', 'board')),
  org_id      uuid references organizations(id) on delete cascade,
  board_id    uuid references boards(id) on delete cascade,
  role        text default 'member' check (role in ('owner', 'admin', 'member')),
  invited_by  uuid references profiles(id) on delete set null,
  max_uses    integer default null,  -- null = unlimited
  use_count   integer default 0 not null,
  expires_at  timestamptz default (now() + interval '7 days') not null,
  created_at  timestamptz default now() not null
);

-- ============================================================
-- CARD COMMENTS
-- ============================================================
create table if not exists card_comments (
  id         uuid primary key default gen_random_uuid(),
  card_id    uuid references cards(id) on delete cascade not null,
  board_id   uuid references boards(id) on delete cascade not null,
  user_id    uuid references profiles(id) on delete cascade not null,
  content    text not null check (char_length(content) > 0),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

drop trigger if exists card_comments_updated_at on card_comments;
create trigger card_comments_updated_at
  before update on card_comments
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — new tables
-- ============================================================
alter table organizations  enable row level security;
alter table org_members    enable row level security;
alter table invitations    enable row level security;
alter table card_comments  enable row level security;

-- Organizations
create policy "orgs: members can read"
  on organizations for select
  using (
    exists (
      select 1 from org_members
      where org_members.org_id = organizations.id
        and org_members.user_id = auth.uid()
    )
  );

create policy "orgs: authenticated can create"
  on organizations for insert
  with check (auth.uid() = owner_id);

create policy "orgs: owner/admin can update"
  on organizations for update
  using (
    exists (
      select 1 from org_members
      where org_members.org_id = organizations.id
        and org_members.user_id = auth.uid()
        and org_members.role in ('owner', 'admin')
    )
  );

create policy "orgs: owner can delete"
  on organizations for delete
  using (owner_id = auth.uid());

-- Org members
create policy "org_members: members can read"
  on org_members for select
  using (
    exists (
      select 1 from org_members om2
      where om2.org_id = org_members.org_id
        and om2.user_id = auth.uid()
    )
  );

create policy "org_members: owner/admin can insert"
  on org_members for insert
  with check (
    auth.uid() = user_id  -- self-join via invite
    or exists (
      select 1 from org_members om2
      where om2.org_id = org_members.org_id
        and om2.user_id = auth.uid()
        and om2.role in ('owner', 'admin')
    )
  );

create policy "org_members: owner/admin can delete"
  on org_members for delete
  using (
    user_id = auth.uid()  -- leave org
    or exists (
      select 1 from org_members om2
      where om2.org_id = org_members.org_id
        and om2.user_id = auth.uid()
        and om2.role in ('owner', 'admin')
    )
  );

create policy "org_members: owner/admin can update"
  on org_members for update
  using (
    exists (
      select 1 from org_members om2
      where om2.org_id = org_members.org_id
        and om2.user_id = auth.uid()
        and om2.role in ('owner', 'admin')
    )
  );

-- Invitations: anyone with auth can read (for accept flow)
create policy "invitations: anyone can read by token"
  on invitations for select
  using (true);

create policy "invitations: board/org managers can insert"
  on invitations for insert
  with check (auth.uid() = invited_by);

create policy "invitations: creator can delete"
  on invitations for delete
  using (invited_by = auth.uid());

create policy "invitations: system can update use_count"
  on invitations for update
  using (true);

-- Card comments: board members can read/write
create policy "comments: board members can read"
  on card_comments for select
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = card_comments.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "comments: board members can insert"
  on card_comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from board_members
      where board_members.board_id = card_comments.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "comments: author can update"
  on card_comments for update
  using (user_id = auth.uid());

create policy "comments: author can delete"
  on card_comments for delete
  using (user_id = auth.uid());

-- ============================================================
-- REALTIME — add new tables
-- ============================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    columns, cards, board_members, card_comments, org_members;
commit;
