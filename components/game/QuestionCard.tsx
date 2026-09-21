'use client';

import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { Question, OptionType } from '@/types/question';
import { ImageOption } from './ImageOption';

interface QuestionCardProps {
  question: Question;
  selectedOption: OptionType | null;
  isRevealed: boolean;
  onSelectOption: (optionId: OptionType) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  isRevealed,
  onSelectOption,
}) => {
  const getDifficultyBadge = (diff: Question['difficulty']) => {
    switch (diff) {
      case 'easy':
        return { label: 'Kolay', color: 'var(--accent-green)', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'medium':
        return { label: 'Orta', color: 'var(--accent-cyan)', bg: 'rgba(0, 240, 255, 0.15)' };
      case 'hard':
        return { label: 'Zor', color: 'var(--accent-purple)', bg: 'rgba(168, 85, 247, 0.15)' };
    }
  };

  const diffBadge = getDifficultyBadge(question.difficulty);

  return (
    <div
      className="glass-panel"
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

        <p
          style={{
            fontSize: '0.95rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {question.description}
        </p>
      </div>

      {/* Image Options Grid */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%',
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
            onSelect={() => onSelectOption(option.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
