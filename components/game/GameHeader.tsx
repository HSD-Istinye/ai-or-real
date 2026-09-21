'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { ScoreDisplay } from './ScoreDisplay';

interface GameHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  onQuit?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentIndex,
  totalQuestions,
  score,
  streak,
  onQuit,
}) => {
  return (
    <header
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Brand / Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              color: '#060913',
            }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                lineHeight: 1.2,
              }}
            >
              SPOT THE <span className="gradient-text-cyan">AI</span>
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Yapay Zekayı Yakala
            </span>
          </div>
        </div>

        {/* Score & Quit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ScoreDisplay score={score} streak={streak} />

          {onQuit ? (
            <button
              onClick={onQuit}
              title="Oyundan Çık"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <X size={18} />
            </button>
          ) : (
            <Link
              href="/"
              title="Ana Sayfaya Dön"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
              }}
            >
              <X size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar current={currentIndex + 1} total={totalQuestions} />
    </header>
  );
};

export default GameHeader;
