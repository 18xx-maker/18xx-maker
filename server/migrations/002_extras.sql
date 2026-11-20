-- Sessions expire. The server sets expires_at on every new session from
-- SESSION_TTL_DAYS; this default only backfills the sessions that exist.
alter table sessions
  add column expires_at timestamptz not null default now() + interval '30 days';

-- The Discord webhook a game's move notices go to (null: none). A secret: no
-- endpoint returns it, the owner only sees whether one is set.
alter table games add column webhook_url text;

-- The code of a game's read-only spectator link (null: no link). A secret like
-- the invite code: only the owner sees it, rotating or deleting it closes the
-- open spectator sockets.
alter table games add column watch_code text unique;
