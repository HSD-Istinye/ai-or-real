'use client';

import React from 'react';
import { CheckCircle2, XCircle, Timer, Zap, Flame } from 'lucide-react';
import { PlayerAnswer } from '@/types/game';

/**
 * Tur sonucu — görsellerin üzerinde kısa süre görünen küçük kart.
 * Uzun açıklama ve ipuçları oyun sonundaki "Soru Detayları"nda.
 */
export const RoundFeedback: React.FC<{ answer: PlayerAnswer }> = ({ answer }) => {
  const { isCorrect, foul, pointsEarned, timeSpentMs, streakAtAnswer } = answer;

  let title = isCorrect ? 'Doğru!' : 'Yanlış';
  let icon = isCorrect ? <CheckCircle2 size={26} /> : <XCircle size={26} />;
  let color = isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
  if (foul === 'timeout') {
    title = 'Süre doldu';
    icon = <Timer size={26} />;
    color = 'var(--accent-amber)';
  } else if (foul === 'guess') {
    title = 'Çok hızlı — tahmin sayıldı';
    icon = <Zap size={26} />;
    color = 'var(--accent-amber)';
  }

  return (
    <div
      className="animate-pop-in"
      role="status"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 20px',
        borderRadius: 999,
        background: 'var(--bg-card)',
        border: `2px solid ${color}`,
        boxShadow: '0 12px 30px rgba(30, 33, 45, 0.25)',
        color: 'var(--text-primary)',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color, display: 'inline-flex' }}>{icon}</span>
      <span style={{ fontSize: '1.15rem', color }}>{title}</span>
      {foul !== 'timeout' && (
        <span style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
          {(timeSpentMs / 1000).toFixed(2)} sn
        </span>
      )}
      <span style={{ fontSize: '1.15rem', color: pointsEarned > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
        +{pointsEarned}
      </span>
      {isCorrect && streakAtAnswer >= 2 && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent-purple)' }}>
          <Flame size={18} /> {streakAtAnswer}x
        </span>
      )}
    </div>
  );
};

export default RoundFeedback;
