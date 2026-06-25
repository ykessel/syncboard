-- ============================================================
-- Syncboard — Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- Extends auth.users with display name and avatar
-- ============================================================
create table if not exists profiles (
  id         uuid references auth.users(id) on delete cascade primary key,
  name       text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- BOARDS
-- ============================================================
create table if not exists boards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  color       text default '#6366f1',
  owner_id    uuid references profiles(id) on delete cascade not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ============================================================
-- BOARD MEMBERS
-- ============================================================
create table if not exists board_members (
  board_id  uuid references boards(id) on delete cascade not null,
  user_id   uuid references profiles(id) on delete cascade not null,
  role      text default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now() not null,
  primary key (board_id, user_id)
);

-- Auto-add owner as member on board creation
create or replace function add_owner_as_member()
returns trigger as $$
begin
  insert into board_members (board_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_board_created on boards;
create trigger on_board_created
  after insert on boards
  for each row execute function add_owner_as_member();

-- ============================================================
-- COLUMNS
-- ============================================================
create table if not exists columns (
  id         uuid primary key default gen_random_uuid(),
  board_id   uuid references boards(id) on delete cascade not null,
  title      text not null,
  position   integer not null default 0,
  color      text default null,
  created_at timestamptz default now() not null
);

-- ============================================================
-- CARDS
-- ============================================================
create table if not exists cards (
  id          uuid primary key default gen_random_uuid(),
  column_id   uuid references columns(id) on delete cascade not null,
  board_id    uuid references boards(id) on delete cascade not null,
  title       text not null,
  description text,
  position    integer not null default 0,
  label       text check (label in ('bug', 'feature', 'improvement', 'design', 'docs', null)),
  due_date    date,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ============================================================
-- UPDATED_AT triggers
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists boards_updated_at on boards;
create trigger boards_updated_at
  before update on boards
  for each row execute function set_updated_at();

drop trigger if exists cards_updated_at on cards;
create trigger cards_updated_at
  before update on cards
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles     enable row level security;
alter table boards       enable row level security;
alter table board_members enable row level security;
alter table columns      enable row level security;
alter table cards        enable row level security;

-- Profiles: users can read all profiles, update only their own
create policy "profiles: read all"
  on profiles for select using (true);

create policy "profiles: update own"
  on profiles for update using (auth.uid() = id);

-- Boards: members can read, owners can update/delete
create policy "boards: members can read"
  on boards for select
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = boards.id
        and board_members.user_id = auth.uid()
    )
  );

create policy "boards: authenticated can create"
  on boards for insert
  with check (auth.uid() = owner_id);

create policy "boards: owner can update"
  on boards for update
  using (owner_id = auth.uid());

create policy "boards: owner can delete"
  on boards for delete
  using (owner_id = auth.uid());

-- Board members
create policy "board_members: members can read"
  on board_members for select
  using (
    exists (
      select 1 from board_members bm2
      where bm2.board_id = board_members.board_id
        and bm2.user_id = auth.uid()
    )
  );

create policy "board_members: owner can manage"
  on board_members for all
  using (
    exists (
      select 1 from boards
      where boards.id = board_members.board_id
        and boards.owner_id = auth.uid()
    )
  );

-- Columns: board members can read/write
create policy "columns: members can read"
  on columns for select
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = columns.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "columns: members can insert"
  on columns for insert
  with check (
    exists (
      select 1 from board_members
      where board_members.board_id = columns.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "columns: members can update"
  on columns for update
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = columns.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "columns: members can delete"
  on columns for delete
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = columns.board_id
        and board_members.user_id = auth.uid()
    )
  );

-- Cards: same as columns
create policy "cards: members can read"
  on cards for select
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = cards.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "cards: members can insert"
  on cards for insert
  with check (
    exists (
      select 1 from board_members
      where board_members.board_id = cards.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "cards: members can update"
  on cards for update
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = cards.board_id
        and board_members.user_id = auth.uid()
    )
  );

create policy "cards: members can delete"
  on cards for delete
  using (
    exists (
      select 1 from board_members
      where board_members.board_id = cards.board_id
        and board_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- REALTIME — enable for live updates
-- ============================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table columns, cards, board_members;
commit;
