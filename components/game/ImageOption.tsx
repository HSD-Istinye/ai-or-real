'use client';

import React from 'react';
import Image from 'next/image';
import { Bot, Camera, CheckCircle2, XCircle } from 'lucide-react';
import { QuestionOption, OptionType } from '@/types/question';

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
      // click yerine pointerdown: fare BASILDIĞI an sayılır (click bırakınca tetiklenir, +80–150 ms)
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        if (!disabled && !isRevealed) {
          onSelect(e.timeStamp);
        }
      }}
      style={{
        position: 'relative',
        flex: '1 1 300px',
        maxWidth: '560px',
        borderRadius: 'var(--radius-lg)',
        border: `2px solid ${borderColor}`,
        boxShadow: glowStyle,
        backgroundColor: 'var(--bg-secondary)',
        overflow: 'hidden',
        cursor: disabled || isRevealed ? 'default' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
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
              <span>Yapay Zekâ (AI)</span>
            </>
          ) : (
            <>
              <Camera size={16} />
              <span>Gerçek Fotoğraf</span>
            </>
          )}
        </div>
      )}

      {/* Image Container */}
      <div
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
          alt={option.label || label}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          style={{
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
            transform: !isRevealed && !disabled ? 'scale(1)' : 'none',
          }}
        />

        {/* Selected Indicator Icon on Reveal */}
        {isRevealed && isSelected && (
          <div
            className="animate-pop-in"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              background: isCorrectChoice
                ? 'rgba(91, 150, 124, 0.96)'
                : 'rgba(189, 120, 148, 0.96)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
            }}
          >
            {isCorrectChoice ? (
              <>
                <CheckCircle2 size={18} />
                <span>Senin Seçimin (Doğru!)</span>
              </>
            ) : (
              <>
                <XCircle size={18} />
                <span>Senin Seçimin (Yanlış)</span>
              </>
            )}
          </div>
        )}

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
