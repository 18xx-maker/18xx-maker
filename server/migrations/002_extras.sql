-- Every statement is safe to run again: a database that applied an earlier
-- version of this file gets the missing columns once its schema_migrations
-- row for 002_extras.sql is deleted and the server restarts.

-- Sessions expire. The server sets expires_at on every new session from
-- SESSION_TTL_DAYS; this default only backfills the sessions that exist.
alter table sessions
  add column if not exists expires_at timestamptz not null
    default now() + interval '30 days';

-- The Discord webhook a game's move notices go to (null: none). A secret: no
-- endpoint returns it, the owner only sees whether one is set.
alter table games add column if not exists webhook_url text;

-- The code of a game's read-only spectator link (null: no link). A secret like
-- the invite code: only the owner sees it, rotating or deleting it closes the
-- open spectator sockets. The index has the name the unique constraint of an
-- earlier version of this file has, so it is not made twice.
alter table games add column if not exists watch_code text;
create unique index if not exists games_watch_code_key on games (watch_code);
