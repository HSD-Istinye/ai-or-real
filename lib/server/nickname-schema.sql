BEGIN;
CREATE TABLE IF NOT EXISTS game.nick_reservation (
  day_start TIMESTAMPTZ NOT NULL,
  nick_key TEXT NOT NULL,
  owner_hash TEXT NOT NULL,
  PRIMARY KEY (day_start, nick_key)
);
ALTER TABLE game.nick_reservation ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON game.nick_reservation FROM PUBLIC, anon, authenticated;
COMMIT;
