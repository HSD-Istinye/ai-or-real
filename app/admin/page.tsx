'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Download, RefreshCw, ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getStats } from '@/lib/net/api';
import { StatsResponse } from '@/types/api';

/**
 * Basit admin paneli: kayıtları gizle/geri getir, günü sıfırla, CSV indir, soru istatistikleri.
 * Token: .env.local içindeki ADMIN_TOKEN.
 */
interface AdminRun {
  id: string;
  nick: string;
  mode: string;
  score: number;
  correct: number;
  total: number;
  avgMs: number | null;
  device: string | null;
  createdAt: string;
  hidden: number;
}

const TOKEN_KEY = 'hsd_admin_token';

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [rows, setRows] = useState<AdminRun[] | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setToken(sessionStorage.getItem(TOKEN_KEY) || '');
    } catch {
      /* yoksay */
    }
  }, []);

  const call = useCallback(
    async (url: string, init?: RequestInit) => {
      const res = await fetch(url, {
        ...init,
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      return data;
    },
    [token],
  );

  const load = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    try {
      const data = await call('/api/admin/runs?limit=200');
      setRows(data.rows);
      setStats(await getStats('today'));
      setError(null);
      try {
        sessionStorage.setItem(TOKEN_KEY, token);
      } catch {
        /* yoksay */
      }
    } catch (e) {
      setError((e as Error).message);
      setRows(null);
    } finally {
      setBusy(false);
    }
  }, [call, token]);

  const toggle = async (r: AdminRun) => {
    try {
      await call('/api/admin/hide', { method: 'POST', body: JSON.stringify({ id: r.id, hidden: !r.hidden }) });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const resetDay = async () => {
    if (!window.confirm('Bugünkü tüm kayıtlar gizlenecek (silinmez). Emin misin?')) return;
    try {
      const d = await call('/api/admin/reset-day', { method: 'POST' });
      setError(null);
      window.alert(`${d.hidden} kayıt gizlendi.`);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const cell: React.CSSProperties = { padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' };

  return (
    <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
        <ShieldAlert color="var(--accent-purple)" /> Admin
      </h1>

      <form
        className="glass-panel"
        style={{ padding: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
          style={{
            flex: '1 1 220px',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
          }}
        />
        <Button type="submit" size="sm" leftIcon={<RefreshCw size={16} />} disabled={busy || !token}>
          Yükle
        </Button>
        {rows && (
          <>
            <a href={`/api/admin/export?token=${encodeURIComponent(token)}`} style={{ textDecoration: 'none' }}>
              <Button type="button" variant="secondary" size="sm" leftIcon={<Download size={16} />}>
                CSV indir
              </Button>
            </a>
            <Button type="button" variant="secondary" size="sm" onClick={resetDay}>
              Günü sıfırla
            </Button>
          </>
        )}
      </form>

      {error && <div style={{ color: 'var(--accent-red)' }}>{error}</div>}

      {stats && (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>
            Bugün: {stats.total} oyun &bull; medyan {stats.median ?? '—'} &bull; en iyi {stats.best ?? '—'} &bull; ort.
            doğruluk %{stats.avgAccuracy ?? '—'}
          </div>
          {stats.questions.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stats.questions.map((q) => (
                <span
                  key={q.questionId}
                  style={{ fontSize: '0.85rem', padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border-subtle)' }}
                >
                  {q.questionId}: %{q.correctRate} doğru ({q.attempts})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {rows && (
        <div className="glass-panel" style={{ padding: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)' }}>
                {['Zaman', 'Nick', 'Puan', 'Doğru', 'Ort.', 'Cihaz', ''].map((h) => (
                  <th key={h} style={cell}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ opacity: r.hidden ? 0.4 : 1 }}>
                  <td style={cell}>{new Date(r.createdAt).toLocaleString('tr-TR')}</td>
                  <td style={{ ...cell, fontWeight: 700 }}>{r.nick}</td>
                  <td style={cell}>{r.score}</td>
                  <td style={cell}>
                    {r.correct}/{r.total}
                  </td>
                  <td style={cell}>{r.avgMs === null ? '—' : `${(r.avgMs / 1000).toFixed(2)} sn`}</td>
                  <td style={cell}>{r.device ?? '—'}</td>
                  <td style={cell}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toggle(r)}
                      leftIcon={r.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    >
                      {r.hidden ? 'Göster' : 'Gizle'}
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td style={cell} colSpan={7}>
                    Kayıt yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
