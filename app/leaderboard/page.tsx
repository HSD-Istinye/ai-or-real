'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Trophy, Users, Wifi, WifiOff, Play } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getLeaderboard } from '@/lib/net/api';
import { LeaderboardResponse, Scope } from '@/types/api';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';

/**
 * Büyük ekran / TV liderlik tablosu.
 * - 3 sn'de bir yenilenir (SSE gerekmez; ileride /api/events eklenebilir).
 * - URL: /leaderboard?scope=alltime&limit=15&tv=1  (tv=1 → butonları gizler)
 */
const REFRESH_MS = 3000;

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
        {data && <LeaderboardTable rows={data.rows} fresh={fresh} size="lg" />}

        {!data && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {online ? 'Yükleniyor…' : 'Sunucuya ulaşılamıyor. "npm run start" çalışıyor mu?'}
          </div>
        )}
      </div>

      {!tv && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link href="/start" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" leftIcon={<Play size={20} fill="currentColor" />}>
              Oyna
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
