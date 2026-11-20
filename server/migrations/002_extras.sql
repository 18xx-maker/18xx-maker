-- Sessions expire. The server sets expires_at on every new session from
-- SESSION_TTL_DAYS; this default only backfills the sessions that exist.
alter table sessions
  add column expires_at timestamptz not null default now() + interval '30 days';

-- The Discord webhook a game's move notices go to (null: none). A secret: no
-- endpoint returns it, the owner only sees whether one is set.
alter table games add column webhook_url text;
