'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, Trophy, WifiOff, ListOrdered } from 'lucide-react';
import Button from '@/components/ui/Button';
import { GameSummary } from '@/types/game';
import { SubmitRunRequest, SubmitRunResponse } from '@/types/api';
import { submitRun } from '@/lib/net/submitRun';
import { ApiRequestError } from '@/lib/net/api';

/** İsim girilmezse bu süre sonunda "???" ile otomatik kaydedilir (stantta kuyruk tıkanmasın). 0 = kapalı. */
const AUTO_SUBMIT_MS = 30_000;
const DEVICE = process.env.NEXT_PUBLIC_DEVICE_ID || 'stand-1';
/** Sadece yapıştırılan dev metinlere karşı teknik sınır (sunucudaki NICK_MAX ile aynı). */
const NICK_INPUT_MAX = 40;

type Phase =
  | { kind: 'input' }
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
      reactionMs: Number.isFinite(a.timeSpentMs) ? a.timeSpentMs : null,
      foul: null,
    })),
  };
}

export default function NameEntry({ summary }: { summary: GameSummary }) {
  const [nick, setNick] = useState('');
  const [phase, setPhase] = useState<Phase>({ kind: 'input' });
  const [left, setLeft] = useState(Math.round(AUTO_SUBMIT_MS / 1000));
  const inputRef = useRef<HTMLInputElement>(null);
  const sentRef = useRef(false);

  // Sayfa yenilendiyse ve bu oyun zaten kaydedildiyse sonucu tekrar göster
  useEffect(() => {
    if (!summary.runId) return;
    try {
      const saved = sessionStorage.getItem(doneKey(summary.runId));
      if (saved) {
        sentRef.current = true;
        setPhase({ kind: 'done', res: JSON.parse(saved) });
        return;
      }
    } catch {
      /* yoksay */
    }
    inputRef.current?.focus();
  }, [summary.runId]);

  const send = async (rawNick: string) => {
    if (sentRef.current || !summary.runId) return;
    sentRef.current = true;
    const finalNick = rawNick.trim().replace(/\s+/g, ' ') || '???';
    setPhase({ kind: 'sending' });
    try {
      const res = await submitRun(buildRequest(summary, finalNick));
      if (res) {
        try {
          sessionStorage.setItem(doneKey(summary.runId), JSON.stringify(res));
        } catch {
          /* yoksay */
        }
        setPhase({ kind: 'done', res });
      } else {
        setPhase({ kind: 'queued' });
      }
    } catch (err) {
      sentRef.current = false;
      setPhase({ kind: 'error', message: err instanceof ApiRequestError ? err.message : 'Kaydedilemedi' });
    }
  };

  // Otomatik kayıt geri sayımı
  useEffect(() => {
    if (phase.kind !== 'input' || AUTO_SUBMIT_MS <= 0) return;
    const t = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [phase.kind]);

  useEffect(() => {
    if (phase.kind === 'input' && AUTO_SUBMIT_MS > 0 && left <= 0) send(nick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  if (!summary.runId || summary.answers.length === 0) return null;

  const panel: React.CSSProperties = {
    width: '100%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    textAlign: 'center',
  };

  if (phase.kind === 'done') {
    const r = phase.res;
    return (
      <div className="glass-panel animate-pop-in" style={{ ...panel, border: '1px solid var(--accent-amber)' }}>
        <Trophy size={30} color="var(--accent-amber)" />
        <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          {r.nick === '???' ? 'İSİMSİZ' : r.nick.toLocaleUpperCase('tr-TR')} &bull; LİDERLİK TABLOSUNA KAYDEDİLDİ
        </div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>
          Bugün <span style={{ color: 'var(--accent-purple)' }}>{r.rankToday}.</span> sıradasın
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          Bugün oynayan {r.totalToday} kişiden <b style={{ color: 'var(--accent-cyan)' }}>{r.beatenToday}</b> kişiyi
          geçtin &bull; yüzdelik dilim %{r.percentile}
        </div>
        <Link href="/leaderboard" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" size="md" leftIcon={<ListOrdered size={18} />}>
            Liderlik Tablosunu Gör
          </Button>
        </Link>
      </div>
    );
  }

  if (phase.kind === 'queued') {
    return (
      <div className="glass-panel" style={panel}>
        <WifiOff size={26} color="var(--accent-amber)" />
        <div style={{ fontWeight: 700 }}>Skorun kaydedildi</div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Sunucuya şu an ulaşılamıyor. Bağlantı gelince liderlik tablosuna otomatik eklenecek.
        </div>
      </div>
    );
  }

  return (
    <form
      className="glass-panel"
      style={panel}
      onSubmit={(e) => {
        e.preventDefault();
        send(nick);
      }}
    >
      <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent-cyan)' }}>
        LİDERLİK TABLOSUNA GİR
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Adını ya da takma adını yaz</div>

      <input
        ref={inputRef}
        value={nick}
        onChange={(e) => {
          // Sadece harf, rakam, boşluk ve . _ - ' kalsın (sunucu da aynı kuralı uygular)
          setNick(e.target.value.replace(/[^\p{L}\p{N} ._'\-]/gu, '').slice(0, NICK_INPUT_MAX));
          if (phase.kind === 'error') setPhase({ kind: 'input' });
        }}
        maxLength={NICK_INPUT_MAX}
        autoComplete="off"
        spellCheck={false}
        disabled={phase.kind === 'sending'}
        aria-label="İsim"
        placeholder="İsmin"
        style={{
          width: '100%',
          maxWidth: '460px',
          textAlign: 'center',
          fontSize: '2rem',
          fontWeight: 800,
          padding: '10px 16px',
          fontFamily: 'var(--font-main)',
          color: 'var(--text-primary)',
          background: 'rgba(255,255,255,0.55)',
          border: '2px solid var(--border-focus)',
          borderRadius: 'var(--radius-md)',
          outline: 'none',
        }}
      />

      {phase.kind === 'error' && (
        <div style={{ color: 'var(--accent-red)', fontSize: '0.9rem' }}>{phase.message}</div>
      )}

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={phase.kind === 'sending' || nick.trim().length === 0}
          leftIcon={<Send size={18} />}
        >
          {phase.kind === 'sending' ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
        <Button type="button" variant="secondary" size="md" disabled={phase.kind === 'sending'} onClick={() => send('')}>
          İsimsiz kaydet
        </Button>
      </div>

      {AUTO_SUBMIT_MS > 0 && phase.kind === 'input' && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {left} sn içinde isim girilmezse &quot;???&quot; olarak kaydedilecek
        </div>
      )}
    </form>
  );
}
