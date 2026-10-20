-- QR access sessions; no game records are modified.
BEGIN;
CREATE TABLE IF NOT EXISTS game.access_session (
  session_hash TEXT PRIMARY KEY,
  scan_hash TEXT NOT NULL UNIQUE,
  scan_expires_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  unlocked_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_access_expiry ON game.access_session(expires_at);
ALTER TABLE game.access_session ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON game.access_session FROM PUBLIC, anon, authenticated;
COMMIT;
