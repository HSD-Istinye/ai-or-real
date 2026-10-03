'use client';

import React from 'react';
import { LeaderboardRow } from '@/types/api';

/**
 * Liderlik tablosu satırları — hem /leaderboard sayfasında hem oyun sonu ekranında kullanılır.
 * - highlightId / highlightNick: oyuncunun kendi satırı (vurgulanır). Aynı isimle daha önce
 *   daha yüksek skor yapıldıysa tabloda o kayıt durur; isimden de eşleştirilir.
 * - fresh: tabloya yeni giren satırlar (kısa süre parlar)
 * - extraRow: oyuncu ilk N'de değilse tablonun altında "…" ile ayrı gösterilir
 * - size: 'lg' büyük ekran için, 'md' sonuç ekranı için
 */
const MEDALS = ['🥇', '🥈', '🥉'];

function fmtSec(ms: number | null) {
  return ms === null ? '—' : `${(ms / 1000).toFixed(2)} sn`;
}

interface Props {
  rows: LeaderboardRow[];
  highlightId?: string | null;
  highlightNick?: string | null;
  fresh?: Set<string>;
  extraRow?: LeaderboardRow | null;
  size?: 'md' | 'lg';
  emptyText?: string;
}

export default function LeaderboardTable({
  rows,
  highlightId,
  highlightNick,
  fresh,
  extraRow,
  size = 'lg',
  emptyText = 'Henüz kimse oynamadı. İlk sen ol!',
}: Props) {
  const big = size === 'lg';
  const key = (n: string) => n.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
  const isMine = (r: LeaderboardRow) =>
    r.id === highlightId || (!!highlightNick && highlightNick !== '???' && r.nick !== '???' && key(r.nick) === key(highlightNick));

  const row = (r: LeaderboardRow) => {
    const mine = isMine(r);
    return (
      <div key={r.id} className={`lb-row ${fresh?.has(r.id) ? 'fresh' : ''} ${mine ? 'mine' : ''}`}>
        <span
          style={{
            fontSize: r.rank <= 3 ? (big ? '2rem' : '1.6rem') : big ? '1.4rem' : '1.15rem',
            fontWeight: 800,
            color: 'var(--text-secondary)',
          }}
        >
          {MEDALS[r.rank - 1] ?? r.rank}
        </span>
        <span
          title={r.nick}
          style={{
            fontSize: big ? 'clamp(1.2rem, 2.6vw, 1.9rem)' : '1.2rem',
            fontWeight: 800,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {r.nick === '???' ? 'İsimsiz' : r.nick}
          {mine && <span className="lb-you">SEN</span>}
        </span>
        <span
          style={{
            textAlign: 'right',
            fontSize: big ? 'clamp(1.3rem, 3vw, 2rem)' : '1.35rem',
            fontWeight: 800,
            color: 'var(--accent-cyan)',
          }}
        >
          {r.score.toLocaleString('tr-TR')}
        </span>
        <span className="lb-hide-sm" style={{ textAlign: 'right', fontSize: big ? '1.1rem' : '0.95rem', color: 'var(--text-secondary)' }}>
          {r.correct}/{r.total}
        </span>
        <span className="lb-hide-sm" style={{ textAlign: 'right', fontSize: big ? '1.1rem' : '0.95rem', color: 'var(--text-secondary)' }}>
          {fmtSec(r.avgMs)}
        </span>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: big ? '10px' : '8px' }}>
      <style>{`
        @keyframes lbFlash { 0%,100% { background: rgba(48,51,66,0.04); } 20%,60% { background: rgba(251,191,36,0.28); } }
        .lb-row { display: grid; grid-template-columns: ${big ? '70px 1fr 140px 110px 120px' : '56px 1fr 110px 80px 96px'};
                  align-items: center; gap: 12px; padding: ${big ? '14px 20px' : '10px 16px'};
                  border-radius: var(--radius-md); background: rgba(48,51,66,0.04); border: 1px solid var(--border-subtle); }
        .lb-row.fresh { animation: lbFlash 1.6s ease-in-out 2; border-color: rgba(251,191,36,0.6); }
        .lb-row.mine { background: var(--accent-cyan-glow); border: 2px solid var(--accent-cyan); }
        .lb-you { margin-left: 10px; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; vertical-align: middle;
                  padding: 3px 8px; border-radius: 999px; background: var(--accent-cyan); color: #fff; }
        .lb-head { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; color: var(--text-muted);
                   background: none; border: none; padding-top: 0; padding-bottom: 0; }
        .lb-gap { text-align: center; color: var(--text-muted); letter-spacing: 0.3em; line-height: 1; }
        @media (max-width: 640px) {
          .lb-row { grid-template-columns: 44px 1fr 90px; padding: 12px; }
          .lb-hide-sm { display: none; }
        }
      `}</style>

      <div className="lb-row lb-head">
        <span>SIRA</span>
        <span>OYUNCU</span>
        <span style={{ textAlign: 'right' }}>PUAN</span>
        <span className="lb-hide-sm" style={{ textAlign: 'right' }}>DOĞRU</span>
        <span className="lb-hide-sm" style={{ textAlign: 'right' }}>ORT. SÜRE</span>
      </div>

      {rows.length === 0 && !extraRow && (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          {emptyText}
        </div>
      )}

      {rows.map(row)}

      {extraRow && !rows.some(isMine) && (
        <>
          <div className="lb-gap">• • •</div>
          {row(extraRow)}
        </>
      )}
    </div>
  );
}
