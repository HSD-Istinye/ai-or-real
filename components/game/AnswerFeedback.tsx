'use client';

import React from 'react';
import { CheckCircle, XCircle, ArrowRight, Lightbulb, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  pointsEarned: number;
  explanation: string;
  aiClues: string[];
  isLastQuestion: boolean;
  onNext: () => void;
}

export const AnswerFeedback: React.FC<AnswerFeedbackProps> = ({
  isCorrect,
  pointsEarned,
  explanation,
  aiClues,
  isLastQuestion,
  onNext,
}) => {
  return (
    <div
      className="glass-panel animate-slide-up"
      style={{
        width: '100%',
        padding: '24px',
        border: `2px solid ${isCorrect ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        background: isCorrect
          ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(12, 18, 34, 0.95) 100%)'
          : 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(12, 18, 34, 0.95) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isCorrect ? (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-green)',
              }}
            >
              <CheckCircle size={24} />
            </div>
          ) : (
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-red)',
              }}
            >
              <XCircle size={24} />
            </div>
          )}

          <div>
            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: isCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
              }}
            >
              {isCorrect ? 'Harika! Doğru Tespit 🎯' : 'Tüh! Yanlış Seçim 🤖'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {isCorrect
                ? 'Yapay zekanın izlerini başarıyla yakaladın!'
                : 'Yapay zeka bu sefer seni yanıltmayı başardı.'}
            </p>
          </div>
        </div>

        {/* Points indicator */}
        {pointsEarned > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '999px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-green)',
              fontWeight: 700,
              fontSize: '1rem',
            }}
          >
            <Zap size={18} />
            <span>+{pointsEarned} Puan</span>
          </div>
        )}
      </div>

      {/* Explanation text */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          color: 'var(--text-primary)',
        }}
      >
        {explanation}
      </div>

      {/* AI Clues Section */}
      {aiClues.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--accent-cyan)',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}
          >
            <Lightbulb size={16} />
            <span>Yapay Zekâ Tespit İpuçları</span>
          </div>

          <ul
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              paddingLeft: '20px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
            }}
          >
            {aiClues.map((clue, index) => (
              <li key={index} style={{ listStyleType: 'disc' }}>
                {clue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Next Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          rightIcon={<ArrowRight size={20} />}
        >
          {isLastQuestion ? 'Sonuçları Gör' : 'Sonraki Soru'}
        </Button>
      </div>
    </div>
  );
};

export default AnswerFeedback;
