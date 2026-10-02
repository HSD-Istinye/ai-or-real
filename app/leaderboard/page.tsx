'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, Wifi, WifiOff, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getLeaderboard } from '@/lib/net/api';
import { LeaderboardResponse, Scope } from '@/types/api';

/**
 * Büyük ekran / TV liderlik tablosu.
 * - 3 sn'de bir yenilenir (SSE gerekmez; ileride /api/events eklenebilir).
 * - URL: /leaderboard?scope=alltime&limit=15&tv=1  (tv=1 → butonları gizler)
 */
const REFRESH_MS = 3000;
const MEDALS = ['🥇', '🥈', '🥉'];

function fmtSec(ms: number | null) {
  return ms === null ? '—' : `${(ms / 1000).toFixed(2)} sn`;
}

export default function LeaderboardPage() {
  const [scope, setScope] = useState<Scope>('today');
  const [limit, setLimit] = useState(10);
  const [tv, setTv] = useState(false);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [online, setOnline] = useState(true);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string> | null>(null);

  // URL parametrelerini oku (useSearchParams yerine — build'de Suspense gerektirmesin)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('scope') === 'alltime') setScope('alltime');
    const l = Number(q.get('limit'));
    if (l >= 3 && l <= 50) setLimit(l);
    setTv(q.get('tv') === '1');
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await getLeaderboard(scope, limit);
      setOnline(true);
      setData(res);

      // Tabloya yeni giren satırları parlat
      const ids = new Set(res.rows.map((r) => r.id));
      if (knownIds.current) {
        const newcomers = new Set([...ids].filter((id) => !knownIds.current!.has(id)));
        if (newcomers.size) {
          setFresh(newcomers);
          setTimeout(() => setFresh(new Set()), 4000);
        }
      }
      knownIds.current = ids;
    } catch {
      setOnline(false);
    }
  }, [scope, limit]);

  useEffect(() => {
    knownIds.current = null;
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  const tab = (s: Scope, label: string) => (
    <button
      onClick={() => setScope(s)}
      className="custom-btn"
      style={{
        padding: '8px 18px',
        fontSize: '0.9rem',
        background: scope === s ? 'var(--accent-cyan)' : 'transparent',
        border: `1px solid ${scope === s ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
        color: scope === s ? '#fff' : 'var(--text-secondary)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style>{`
        @keyframes lbFlash { 0%,100% { background: rgba(48,51,66,0.04); } 20%,60% { background: rgba(251,191,36,0.28); } }
        .lb-row { display: grid; grid-template-columns: 70px 1fr 140px 110px 120px; align-items: center;
                  gap: 12px; padding: 14px 20px; border-radius: var(--radius-md);
                  background: rgba(48,51,66,0.04); border: 1px solid var(--border-subtle); }
        .lb-row.fresh { animation: lbFlash 1.6s ease-in-out 2; border-color: rgba(251,191,36,0.6); }
        .lb-head { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted);
                   background: none; border: none; padding-top: 0; padding-bottom: 0; }
        @media (max-width: 640px) {
          .lb-row { grid-template-columns: 44px 1fr 90px; padding: 12px; }
          .lb-hide-sm { display: none; }
        }
      `}</style>

      {/* Başlık */}
      <div
        className="glass-panel"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', padding: '20px 24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Trophy size={40} color="var(--accent-amber)" />
          <div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.1 }}>
              <span style={{ color: 'var(--text-primary)' }}>Liderlik Tablosu</span>
            </h1>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: '16px', alignItems: 'center', marginTop: 4 }}>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <Users size={16} /> {data ? data.totalPlayers : '—'} oyun
              </span>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: online ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {online ? <Wifi size={16} /> : <WifiOff size={16} />} {online ? 'canlı' : 'sunucuya ulaşılamıyor'}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {tab('today', 'Bugün')}
          {tab('alltime', 'Tüm Zamanlar')}
        </div>
      </div>

      {/* Tablo */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="lb-row lb-head">
          <span>SIRA</span>
          <span>OYUNCU</span>
          <span style={{ textAlign: 'right' }}>PUAN</span>
          <span className="lb-hide-sm" style={{ textAlign: 'right' }}>DOĞRU</span>
          <span className="lb-hide-sm" style={{ textAlign: 'right' }}>ORT. SÜRE</span>
        </div>

        {data && data.rows.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
            Henüz kimse oynamadı. İlk sen ol!
          </div>
        )}

        {data?.rows.map((r) => (
          <div key={r.id} className={`lb-row ${fresh.has(r.id) ? 'fresh' : ''}`}>
            <span style={{ fontSize: r.rank <= 3 ? '2rem' : '1.4rem', fontWeight: 800, color: 'var(--text-secondary)' }}>
              {MEDALS[r.rank - 1] ?? r.rank}
            </span>
            <span
              title={r.nick}
              style={{
                fontSize: 'clamp(1.2rem, 2.6vw, 1.9rem)',
                fontWeight: 800,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {r.nick === '???' ? 'İsimsiz' : r.nick}
            </span>
            <span style={{ textAlign: 'right', fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--accent-cyan)' }}>
              {r.score.toLocaleString('tr-TR')}
            </span>
            <span className="lb-hide-sm" style={{ textAlign: 'right', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              {r.correct}/{r.total}
            </span>
            <span className="lb-hide-sm" style={{ textAlign: 'right', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              {fmtSec(r.avgMs)}
            </span>
          </div>
        ))}

        {!data && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {online ? 'Yükleniyor…' : 'Sunucuya ulaşılamıyor. "npm run start" çalışıyor mu?'}
          </div>
        )}
      </div>

      {!tv && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link href="/game" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" leftIcon={<Play size={20} fill="currentColor" />}>
              Oyna
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
