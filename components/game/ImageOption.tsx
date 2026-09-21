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
  onSelect: () => void;
}

export const ImageOption: React.FC<ImageOptionProps> = ({
  option,
  label,
  isSelected,
  isRevealed,
  targetAnswer,
  disabled,
  onSelect,
}) => {
  const isAi = option.id === 'ai';
  const isCorrectChoice = option.id === targetAnswer;

  // Determine border and glow colors
  let borderColor = 'var(--border-subtle)';
  let glowStyle = 'none';

  if (isRevealed) {
    if (isAi) {
      borderColor = 'var(--accent-purple)';
      glowStyle = '0 0 20px rgba(168, 85, 247, 0.4)';
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
      onClick={() => {
        if (!disabled && !isRevealed) {
          onSelect();
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
            background: isAi ? 'rgba(168, 85, 247, 0.9)' : 'rgba(16, 185, 129, 0.9)',
            color: '#ffffff',
            boxShadow: isAi
              ? '0 0 16px rgba(168, 85, 247, 0.6)'
              : '0 0 16px rgba(16, 185, 129, 0.6)',
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
              ? 'rgba(16, 185, 129, 0.95)'
              : 'rgba(239, 68, 68, 0.95)',
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

      {/* Image Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '4 / 3',
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
      {isRevealed && option.sourceDescription && (
        <div
          className="animate-slide-up"
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
