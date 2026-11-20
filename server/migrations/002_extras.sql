-- Sessions expire. The server sets expires_at on every new session from
-- SESSION_TTL_DAYS; this default only backfills the sessions that exist.
alter table sessions
  add column expires_at timestamptz not null default now() + interval '30 days';
