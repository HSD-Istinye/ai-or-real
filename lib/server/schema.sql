-- Run once in Supabase SQL Editor before starting the application.
BEGIN;
CREATE SCHEMA IF NOT EXISTS game;
REVOKE ALL ON SCHEMA game FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS game.run (
  id TEXT PRIMARY KEY,
  nick TEXT NOT NULL,
  nick_key TEXT NOT NULL DEFAULT '',
  mode TEXT NOT NULL DEFAULT 'solo' CHECK (mode IN ('solo', 'duel')),
  score INTEGER NOT NULL CHECK (score >= 0),
  correct INTEGER NOT NULL CHECK (correct >= 0),
  total INTEGER NOT NULL CHECK (total >= correct),
  avg_ms INTEGER,
  max_streak INTEGER NOT NULL DEFAULT 0,
  device TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL,
  hidden INTEGER NOT NULL DEFAULT 0 CHECK (hidden IN (0, 1))
);
CREATE TABLE IF NOT EXISTS game.answer (
  run_id TEXT NOT NULL REFERENCES game.run(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL CHECK (idx >= 0),
  question_id TEXT NOT NULL,
  choice TEXT CHECK (choice IN ('real', 'ai')),
  correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
  reaction_ms INTEGER,
  points INTEGER NOT NULL DEFAULT 0,
  foul TEXT CHECK (foul IN ('early', 'guess', 'timeout')),
  PRIMARY KEY (run_id, idx)
);
CREATE INDEX IF NOT EXISTS idx_run_board ON game.run(mode, hidden, created_at, score DESC, avg_ms);
CREATE INDEX IF NOT EXISTS idx_run_nick_key ON game.run(nick_key);
CREATE INDEX IF NOT EXISTS idx_answer_q ON game.answer(question_id);
ALTER TABLE game.run ENABLE ROW LEVEL SECURITY;
ALTER TABLE game.answer ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA game FROM PUBLIC, anon, authenticated;
-- Private schema; only the server database connection (postgres role) has access.
COMMIT;
