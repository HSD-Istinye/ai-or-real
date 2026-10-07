'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Trophy, WifiOff } from 'lucide-react';
import { GameSummary } from '@/types/game';
import { LeaderboardResponse, LeaderboardRow, SubmitRunRequest, SubmitRunResponse } from '@/types/api';
import { submitRun } from '@/lib/net/submitRun';
import { ApiRequestError, getLeaderboard } from '@/lib/net/api';
import LeaderboardTable from './LeaderboardTable';

/**
 * Oyun sonu: skoru oyuncunun başta girdiği isimle OTOMATİK kaydeder,
 * ardından sıralamayı ve liderlik tablosunu (oyuncunun satırı vurgulu) gösterir.
 */
const DEVICE = process.env.NEXT_PUBLIC_DEVICE_ID || 'stand-1';
const TOP_N = 10;

type Phase =
  | { kind: 'sending' }
  | { kind: 'done'; res: SubmitRunResponse }
  | { kind: 'queued' }
  | { kind: 'error'; message: string };

function doneKey(runId: string) {
  return `spot_the_ai_submitted_${runId}`;
}

function buildRequest(summary: GameSummary, nick: string): SubmitRunRequest {
  return {
    id: summary.runId!,
    nick,
    mode: 'solo',
    device: DEVICE,
    createdAt: summary.playedAt || new Date().toISOString(),
    answers: summary.answers.map((a) => ({
      questionId: a.questionId,
      choice: a.selectedOption ?? null,
      reactionMs: a.foul === 'timeout' || !Number.isFinite(a.timeSpentMs) ? null : a.timeSpentMs,
      foul: a.foul ?? null, // bilgi amaçlı — sunucu kendisi yeniden hesaplar
    })),
  };
}

export default function RunResult({ summary }: { summary: GameSummary }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'sending' });
  const [board, setBoard] = useState<LeaderboardResponse | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!summary.runId || summary.answers.length === 0 || started.current) return;
    started.current = true;
    const runId = summary.runId;

    const loadBoard = async () => {
      try {
        setBoard(await getLeaderboard('today', TOP_N));
      } catch {
        /* tablo yüklenemedi — sıralama kartı yine görünür */
      }
    };

    (async () => {
      // Sayfa yenilendiyse tekrar gönderme, kayıtlı sonucu göster
      try {
        const saved = sessionStorage.getItem(doneKey(runId));
        const res = saved ? (JSON.parse(saved) as SubmitRunResponse) : null;
        if (res?.bestToday) {
          // eski biçimde kayıtlıysa (bestToday yok) yeniden gönder; aynı id çift kayıt açmaz
          setPhase({ kind: 'done', res });
          await loadBoard();
          return;
        }
      } catch {
        /* yoksay */
      }

      const nick = summary.nick?.trim() || '???';
      try {
        let res: SubmitRunResponse | null;
        try {
          res = await submitRun(buildRequest(summary, nick));
        } catch (err) {
          // İsim sunucuda reddedildiyse (uygunsuz isim) skoru kaybetme, isimsiz kaydet
          if (err instanceof ApiRequestError && err.status === 400 && nick !== '???') {
            res = await submitRun(buildRequest(summary, '???'));
          } else {
            throw err;
          }
        }
        if (!res) {
          setPhase({ kind: 'queued' });
          return;
        }
        try {
          sessionStorage.setItem(doneKey(runId), JSON.stringify(res));
        } catch {
          /* yoksay */
        }
        setPhase({ kind: 'done', res });
        await loadBoard();
      } catch (err) {
        setPhase({ kind: 'error', message: err instanceof ApiRequestError ? err.message : 'Skor kaydedilemedi' });
      }
    })();
  }, [summary]);

  if (!summary.runId || summary.answers.length === 0) return null;

  const panel: React.CSSProperties = {
    width: '100%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  };

  if (phase.kind === 'sending') {
    return (
      <div className="glass-panel" style={{ ...panel, alignItems: 'center', color: 'var(--text-secondary)' }}>
        Skorun kaydediliyor…
      </div>
    );
  }

  if (phase.kind === 'queued' || phase.kind === 'error') {
    return (
      <div className="glass-panel" style={{ ...panel, alignItems: 'center', textAlign: 'center' }}>
        <WifiOff size={26} color="var(--accent-amber)" />
        <div style={{ fontWeight: 700 }}>
          {phase.kind === 'queued' ? 'Skorun kaydedildi' : phase.message}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {phase.kind === 'queued'
            ? 'Sunucuya şu an ulaşılamıyor. Bağlantı gelince liderlik tablosuna otomatik eklenecek.'
            : 'Liderlik tablosu şu an gösterilemiyor.'}
        </div>
      </div>
    );
  }

  const r = phase.res;
  // Tablo oyuncuyu bugünkü en iyi oyunuyla gösterir; kendi satırı da o oyun olmalı
  const ownRow: LeaderboardRow = {
    rank: r.rankToday,
    id: r.bestToday.id,
    nick: r.nick,
    score: r.bestToday.score,
    correct: r.bestToday.correct,
    total: r.bestToday.total,
    avgMs: r.bestToday.avgMs,
    createdAt: new Date().toISOString(),
  };

  return (
    <div className="glass-panel animate-pop-in" style={{ ...panel, border: '1px solid var(--accent-amber)' }}>
      {/* Sıralama */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
        <Trophy size={30} color="var(--accent-amber)" />
        <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          {r.nick === '???' ? 'İSİMSİZ' : r.nick.toLocaleUpperCase('tr-TR')} &bull; LİDERLİK TABLOSU
        </div>
        <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800 }}>
          Bugün <span style={{ color: 'var(--accent-purple)' }}>{r.rankToday}.</span> sıradasın
        </div>
        {r.rankThisRun !== r.rankToday && (
          <div style={{ color: 'var(--text-secondary)' }}>
            Bu oyunda: <b>{r.rankThisRun}.</b> &bull; bugünkü en iyi skorun <b>{r.bestToday.score}</b>
          </div>
        )}
        <div style={{ color: 'var(--text-secondary)' }}>
          Bugün oynayan {r.totalToday} kişiden <b style={{ color: 'var(--accent-cyan)' }}>{r.beatenToday}</b> kişiyi
          geçtin &bull; yüzdelik dilim %{r.percentile}
        </div>
      </div>

      {/* Tablo */}
      {board ? (
        <LeaderboardTable rows={board.rows} highlightId={r.bestToday.id} highlightNick={r.nick} extraRow={ownRow} size="md" />
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Tablo yükleniyor…</div>
      )}
    </div>
  );
}
