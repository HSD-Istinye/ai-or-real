'use client';

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(Math.round((current / total) * 100), 100);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          fontWeight: 500,
        }}
      >
        <span>
          İlerleme: <strong style={{ color: 'var(--text-primary)' }}>{current}</strong> / {total}
        </span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>%{percentage}</span>
      </div>

      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #00f0ff 100%)',
            borderRadius: '999px',
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.7)',
            transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
