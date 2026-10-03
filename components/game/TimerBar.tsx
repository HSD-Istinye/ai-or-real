'use client';

import React from 'react';

/**
 * Süre çubuğu: görseller göründüğü an dolu başlar, süre sınırında boşalır.
 * Her turda farklı `roundKey` verilmeli ki animasyon baştan başlasın.
 * running=false → animasyon olduğu yerde durur (cevap verildiğinde).
 */
interface TimerBarProps {
  roundKey: string | number;
  durationMs: number;
  running: boolean;
  visible: boolean;
}

export const TimerBar: React.FC<TimerBarProps> = ({ roundKey, durationMs, running, visible }) => (
  <div
    aria-hidden
    style={{
      width: '100%',
      height: 10,
      borderRadius: 999,
      background: 'rgba(48, 51, 66, 0.1)',
      overflow: 'hidden',
    }}
  >
    <style>{`
      @keyframes hsdTimer { from { transform: scaleX(1); } to { transform: scaleX(0); } }
      @keyframes hsdTimerColor {
        0%   { background: var(--accent-green); }
        60%  { background: var(--accent-amber); }
        100% { background: var(--accent-red); }
      }
    `}</style>
    {visible && (
      <div
        key={roundKey}
        style={{
          height: '100%',
          width: '100%',
          transformOrigin: 'left center',
          animation: `hsdTimer ${durationMs}ms linear forwards, hsdTimerColor ${durationMs}ms linear forwards`,
          animationPlayState: running ? 'running' : 'paused',
        }}
      />
    )}
  </div>
);

export default TimerBar;
