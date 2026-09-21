'use client';

import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  streak: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, streak }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Streak Badge */}
      {streak > 0 && (
        <div
          className="animate-pop-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            fontSize: '0.875rem',
            fontWeight: 700,
            boxShadow: '0 0 14px rgba(245, 158, 11, 0.25)',
          }}
        >
          <Flame size={18} color="#f59e0b" className="animate-pulse-glow" />
          <span>{streak}x Seri</span>
        </div>
      )}

      {/* Score Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(0, 240, 255, 0.1)',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          fontWeight: 700,
          boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)',
        }}
      >
        <Trophy size={18} color="var(--accent-cyan)" />
        <span style={{ color: 'var(--accent-cyan)' }}>{score}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Puan
        </span>
      </div>
    </div>
  );
};

export default ScoreDisplay;
