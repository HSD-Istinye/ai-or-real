'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Bot, Camera } from 'lucide-react';
import { QuestionOption, OptionType } from '@/types/question';
import { useT } from '@/lib/i18n';

interface ImageOptionProps {
  option: QuestionOption;
  label: string; // "Seçenek A" or "Seçenek B"
  isSelected: boolean;
  isRevealed: boolean;
  targetAnswer: OptionType; // Which one was the correct answer (usually 'ai')
  disabled: boolean;
  /** Basılma anının zaman damgasıyla çağrılır (event.timeStamp) — süre ölçümü için. */
  onSelect: (eventTimeStamp: number) => void;
  /** Klavye kısayolu ipucu, ör. "←" / "→" */
  keyHint?: string;
  /** Görselin en fazla yüksekliği (ör. ekrana sığması için) */
  maxImageHeight?: string;
  /** false → cevaptan sonra alt açıklama gösterilmez (süreli modda düzen kaymasın) */
  showSourceDescription?: boolean;
}

export const ImageOption: React.FC<ImageOptionProps> = ({
  option,
  label,
  isSelected,
  isRevealed,
  targetAnswer,
  disabled,
  onSelect,
  keyHint,
  maxImageHeight,
  showSourceDescription = true,
}) => {
  const t = useT();
  const touch = useRef<{ id: number; x: number; y: number; time: number } | null>(null);
  useEffect(() => { touch.current = null; }, [option.imageUrl, disabled, isRevealed]);
  const isAi = option.id === 'ai';
  const isCorrectChoice = option.id === targetAnswer;

  // Determine border and glow colors
  let borderColor = 'var(--border-subtle)';
  let glowStyle = 'none';

  if (isRevealed) {
    if (isAi) {
      borderColor = 'var(--accent-purple)';
      glowStyle = '0 0 20px rgba(141, 123, 180, 0.22)';
    } else {
      borderColor = 'var(--accent-green)';
      glowStyle = '0 0 20px rgba(16, 185, 129, 0.4)';
    }

    if (isSelected) {
      if (isCorrectChoice) {
        borderColor = 'var(--accent-green)';
        glowStyle = '0 0 30px rgba(16, 185, 129, 0.7)';
      } else {
        borderColor = 'var(--accent-red)';
        glowStyle = '0 0 30px rgba(239, 68, 68, 0.7)';
      }
    }
  } else if (isSelected) {
    borderColor = 'var(--accent-cyan)';
    glowStyle = 'var(--shadow-glow)';
  }

  return (
    <div
      className="image-option"
      // Mouse responds immediately; touch waits for release to distinguish a tap from scrolling.
      onPointerDown={(e) => {
        touch.current = null;
        if (e.button !== 0 || !e.isPrimary || disabled || isRevealed) return;
        if (e.pointerType === 'mouse') onSelect(e.timeStamp);
        else touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY, time: e.timeStamp };
      }}
      onPointerMove={(e) => {
        const start = touch.current;
        if (start && start.id === e.pointerId && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) touch.current = null;
      }}
      onPointerUp={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start || start.id !== e.pointerId || disabled || isRevealed) return;
        const bounds = e.currentTarget.getBoundingClientRect();
        if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) return;
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) <= 10 && e.timeStamp - start.time < 500) {
          onSelect(start.time);
        }
      }}
      onPointerCancel={() => { touch.current = null; }}
      onPointerLeave={() => { touch.current = null; }}
      style={{
        position: 'relative',
        touchAction: 'pan-y pinch-zoom',
        userSelect: 'none',
        flex: '1 1 300px',
        maxWidth: '560px',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${borderColor}`,
        boxShadow: glowStyle,
        backgroundColor: 'var(--bg-secondary)',
        overflow: 'hidden',
        cursor: disabled || isRevealed ? 'default' : 'pointer',
        // 'all' olmasın: visibility de geçişe girer, gizlenen görseller 0.3 sn görünür kalır
        transition: ['border-color', 'box-shadow', 'transform']
          .map((p) => `${p} 0.3s cubic-bezier(0.16, 1, 0.3, 1)`)
          .join(', '),
        transform: isSelected && !isRevealed ? 'scale(1.02)' : 'none',
      }}
    >
      {/* Option Tag Badge (A / B) */}
      <div
        className={`image-option-label${isSelected ? ' image-option-label-selected' : ''}`}
        style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: isSelected ? 'var(--accent-cyan)' : 'rgba(10, 15, 30, 0.75)',
          color: isSelected ? '#060913' : 'var(--text-primary)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.85rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        <span>{label}</span>
        {keyHint && (
          <kbd
            style={{
              fontFamily: 'inherit',
              fontSize: '0.8rem',
              padding: '1px 7px',
              borderRadius: 6,
              border: '1px solid currentColor',
              opacity: 0.85,
            }}
          >
            {keyHint}
          </kbd>
        )}
      </div>

      {/* Revealed Status Badge */}
      {isRevealed && (
        <div
          className="animate-pop-in"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            background: isAi ? 'rgba(141, 123, 180, 0.94)' : 'rgba(91, 150, 124, 0.94)',
            color: '#ffffff',
            boxShadow: isAi
              ? 'none'
              : 'none',
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {isAi ? (
            <>
              <Bot size={16} />
              <span>{t.game.aiBadge}</span>
            </>
          ) : (
            <>
              <Camera size={16} />
              <span>{t.game.realBadge}</span>
            </>
          )}
        </div>
      )}

      {/* Image Container */}
      <div
        className="image-option-frame"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
          maxHeight: maxImageHeight,
          overflow: 'hidden',
          backgroundColor: '#0c1322',
        }}
      >
        <Image
          src={option.imageUrl}
          alt={label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          draggable={false}
          style={{
            objectFit: 'contain',
            transition: 'transform 0.4s ease',
            transform: !isRevealed && !disabled ? 'scale(1)' : 'none',
          }}
        />

        {/* Hover overlay hint */}
        {!isRevealed && !disabled && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(6, 9, 19, 0.6) 0%, transparent 60%)',
              opacity: isSelected ? 0.9 : 0.4,
              transition: 'opacity 0.2s ease',
            }}
          />
        )}
      </div>

      {/* Bottom Description after Reveal */}
      {isRevealed && showSourceDescription && option.sourceDescription && (
        <div
          className="animate-slide-up image-option-description"
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            background: 'rgba(10, 15, 30, 0.5)',
          }}
        >
          {option.sourceDescription}
        </div>
      )}
    </div>
  );
};

export default ImageOption;
