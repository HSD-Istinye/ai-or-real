'use client';

import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { Question, OptionType } from '@/types/question';
import { ImageOption } from './ImageOption';

interface QuestionCardProps {
  question: Question;
  selectedOption: OptionType | null;
  isRevealed: boolean;
  onSelectOption: (optionId: OptionType, eventTimeStamp: number) => void;
  /** Görsellerin kapsayıcısı — süreli modda görünürlüğü doğrudan bu elemandan açılır. */
  imagesRef?: React.Ref<HTMLDivElement>;
  /** false → görseller yer kaplar ama görünmez (yüklenirken / beklerken) */
  imagesVisible?: boolean;
  /** Görsellerin üzerinde ortalanmış içerik ("Hazır ol…", tur sonucu) */
  overlay?: React.ReactNode;
  /** Görsellerin üstünde gösterilecek içerik (süre çubuğu) */
  topSlot?: React.ReactNode;
  /** true → uzun açıklama gizlenir (süreli modda okumaya vakit yok) */
  compact?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  isRevealed,
  onSelectOption,
  imagesRef,
  imagesVisible = true,
  overlay,
  topSlot,
  compact = false,
}) => {
  const getDifficultyBadge = (diff: Question['difficulty']) => {
    switch (diff) {
      case 'easy':
        return { label: 'Kolay', color: 'var(--accent-green)', bg: 'rgba(91, 150, 124, 0.13)' };
      case 'medium':
        return { label: 'Orta', color: 'var(--accent-cyan)', bg: 'rgba(113, 141, 188, 0.13)' };
      case 'hard':
        return { label: 'Zor', color: 'var(--accent-purple)', bg: 'rgba(141, 123, 180, 0.13)' };
    }
  };

  const diffBadge = getDifficultyBadge(question.difficulty);

  return (
    <div
      className="glass-panel question-panel"
      style={{
        width: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: diffBadge.bg,
              color: diffBadge.color,
              border: `1px solid ${diffBadge.color}40`,
            }}
          >
            {diffBadge.label}
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            {question.category}
          </span>
        </div>

        <h2
          style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {question.title}
        </h2>

        {!compact && (
          <p
            style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {question.description}
          </p>
        )}
      </div>

      {topSlot}

      {/* Image Options Grid */}
      <div style={{ position: 'relative', width: '100%' }}>
      <div
        ref={imagesRef}
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%',
          visibility: imagesVisible ? 'visible' : 'hidden',
        }}
      >
        {question.options.map((option, idx) => (
          <ImageOption
            key={option.id}
            option={option}
            label={option.label || (idx === 0 ? 'Seçenek A' : 'Seçenek B')}
            isSelected={selectedOption === option.id}
            isRevealed={isRevealed}
            targetAnswer={question.correctAnswer}
            disabled={isRevealed}
            onSelect={(ts) => onSelectOption(option.id, ts)}
            keyHint={idx === 0 ? '←' : '→'}
            maxImageHeight={compact ? 'max(240px, calc(100vh - 360px))' : undefined}
            showSourceDescription={!compact}
          />
        ))}
      </div>
      {overlay && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {overlay}
        </div>
      )}
      </div>
    </div>
  );
};

export default QuestionCard;
