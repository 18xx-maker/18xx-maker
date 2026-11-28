create table users (
  id uuid primary key default gen_random_uuid(),
  discord_id text unique not null,
  name text not null,
  avatar text,
  can_create boolean not null default false,
  created_at timestamptz not null default now()
);

create table sessions (
  token_hash text primary key,
  user_id uuid not null references users on delete cascade,
  created_at timestamptz not null default now()
);

create table games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  owner_id uuid not null references users,
  game_json jsonb not null,
  config_json jsonb not null default '{}',
  invite_code text unique not null,
  status text not null default 'active'
    check (status in ('active', 'locked', 'archived')),
  created_at timestamptz not null default now()
);

create table seats (
  game_id uuid references games on delete cascade,
  user_id uuid references users,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create table game_assets (
  game_id uuid references games on delete cascade,
  name text not null,
  content_type text not null,
  data bytea not null,
  created_at timestamptz not null default now(),
  primary key (game_id, name)
);

create table events (
  game_id uuid references games on delete cascade,
  seq integer not null,
  user_id uuid not null references users,
  type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  primary key (game_id, seq)
);

create table snapshots (
  game_id uuid references games on delete cascade,
  seq integer not null,
  state jsonb not null,
  created_at timestamptz not null default now(),
  primary key (game_id, seq)
);
