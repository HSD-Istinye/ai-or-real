-- Spot the AI — leaderboard şeması (SQLite)
-- Bu dosya hem sunucu (lib/server/db.ts) hem seed scripti tarafından okunur.
-- Tablo değişikliği yapacaksanız: data/game.db dosyasını silip yeniden oluşturun
-- (ya da ALTER TABLE ile elle güncelleyin).

CREATE TABLE IF NOT EXISTS run (
  id          TEXT PRIMARY KEY,               -- UUID, istemci üretir (idempotent kayıt)
  nick        TEXT    NOT NULL,               -- oyuncunun yazdığı isim ('???' = isimsiz)
  nick_key    TEXT    NOT NULL DEFAULT '',    -- küçük harfli hâli; aynı kişiyi gruplamak için
  mode        TEXT    NOT NULL DEFAULT 'solo',-- 'solo' | 'duel'
  score       INTEGER NOT NULL,               -- SUNUCU hesaplar
  correct     INTEGER NOT NULL,
  total       INTEGER NOT NULL,
  avg_ms      INTEGER,                        -- doğru cevapların ort. süresi (eşitlik bozucu)
  max_streak  INTEGER NOT NULL DEFAULT 0,
  device      TEXT,                           -- 'stand-1' vb. (birden fazla laptop olursa)
  created_at  TEXT    NOT NULL,               -- oyunun oynandığı an (ISO 8601, UTC)
  received_at TEXT    NOT NULL,               -- sunucuya ulaştığı an
  hidden      INTEGER NOT NULL DEFAULT 0      -- admin gizlerse 1 (silinmez)
);

CREATE TABLE IF NOT EXISTS answer (
  run_id      TEXT    NOT NULL REFERENCES run(id) ON DELETE CASCADE,
  idx         INTEGER NOT NULL,               -- oyundaki sıra (0'dan)
  question_id TEXT    NOT NULL,
  choice      TEXT,                           -- 'real' | 'ai' | NULL (süre doldu)
  correct     INTEGER NOT NULL,
  reaction_ms INTEGER,
  points      INTEGER NOT NULL DEFAULT 0,
  foul        TEXT,                           -- NULL | 'early' | 'guess' | 'timeout' (refleks modu için)
  PRIMARY KEY (run_id, idx)
);

CREATE INDEX IF NOT EXISTS idx_run_board ON run(mode, hidden, created_at, score DESC, avg_ms);
CREATE INDEX IF NOT EXISTS idx_run_nick_key ON run(nick_key);
CREATE INDEX IF NOT EXISTS idx_answer_q  ON answer(question_id);
