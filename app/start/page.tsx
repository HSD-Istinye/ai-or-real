'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Trophy, UserRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import { checkNick, ApiRequestError } from '@/lib/net/api';
import { getPlayerNick, NICK_INPUT_MAX, sanitizeNickInput, setPlayerNick } from '@/lib/player';

/**
 * Oyuna başlamadan önce oyuncunun ismini alır.
 * İsim sunucuda kontrol edilir (uygunsuz isim filtresi), sonra /game açılır.
 * Oyun bitince skor bu isimle otomatik kaydedilir.
 */
export default function StartPage() {
  const router = useRouter();
  const [nick, setNick] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = getPlayerNick();
    if (saved) setNick(saved);
    inputRef.current?.focus();
  }, []);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nick.trim().replace(/\s+/g, ' ');
    if (!trimmed) {
      setError('Lütfen bir isim yaz');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await checkNick(trimmed);
      setPlayerNick(res.nick);
      router.push('/game');
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 400) {
        setError(err.message);
        setBusy(false);
        inputRef.current?.focus();
        return;
      }
      // Sunucuya ulaşılamadı → yine de oyna; isim oyun sonunda kontrol edilir
      setPlayerNick(trimmed);
      router.push('/game');
    }
  };

  return (
    <div
      className="animate-pop-in"
      style={{ width: '100%', maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <form
        onSubmit={start}
        className="glass-panel"
        style={{
          padding: '36px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
        }}
      >
        <span
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--accent-cyan-glow)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <UserRound size={30} color="var(--accent-cyan)" />
        </span>

        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-cyan)',
          }}
        >
          Oyuna başlamadan önce
        </span>

        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 800, lineHeight: 1.15 }}>
          İsmin ne?
        </h1>

        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, lineHeight: 1.5 }}>
          Oyun bitince skorun bu isimle liderlik tablosuna yazılacak.
        </p>

        <input
          ref={inputRef}
          value={nick}
          onChange={(e) => {
            setNick(sanitizeNickInput(e.target.value));
            if (error) setError(null);
          }}
          maxLength={NICK_INPUT_MAX}
          autoComplete="off"
          spellCheck={false}
          disabled={busy}
          aria-label="İsim"
          placeholder="Adın ya da takma adın"
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: '1.6rem',
            fontWeight: 700,
            fontFamily: 'var(--font-main)',
            padding: '12px 16px',
            color: 'var(--text-primary)',
            background: 'rgba(255,255,255,0.55)',
            border: `2px solid ${error ? 'var(--accent-red)' : 'var(--border-focus)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
          }}
        />

        {error && (
          <div role="alert" style={{ color: 'var(--accent-red)', fontSize: '0.95rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={busy || nick.trim().length === 0}
          rightIcon={<ArrowRight size={19} />}
        >
          {busy ? 'Hazırlanıyor…' : 'Oyuna başla'}
        </Button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link
          href="/leaderboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            textDecoration: 'none',
            opacity: 0.85,
          }}
        >
          <Trophy size={16} /> Liderlik tablosuna bak
        </Link>
      </div>
    </div>
  );
}
