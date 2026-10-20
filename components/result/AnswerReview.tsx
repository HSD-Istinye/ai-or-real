'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Timer, Zap, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ImageOption } from '@/components/game/ImageOption';
import { QUESTIONS } from '@/lib/game/questions';
import { GameSummary } from '@/types/game';
import { QuestionOption } from '@/types/question';
import { useT } from '@/lib/i18n';

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

/**
 * "Cevapları gör": oyundaki soruları sırayla, oyunda göründükleri sol/sağ düzeninde gösterir.
 * AI olan görsel ve oyuncunun seçimi (doğru/yanlış) işaretlidir. ← / → ile gezilir, Esc kapatır.
 */
export default function AnswerReview({
  summary,
  startIndex = 0,
  onClose,
}: {
  summary: GameSummary;
  startIndex?: number;
  onClose: () => void;
}) {
  const t = useT();
  const r = t.review;
  const total = summary.answers.length;
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight') setIndex((i) => Math.min(total - 1, i + 1));
      else if (e.key === 'Escape') onClose();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [total, onClose]);

  const answer = summary.answers[index];
  const question = answer && BY_ID.get(answer.questionId);
  if (!answer || !question) return null;

  // Oyundaki düzen; eski kayıtlarda yoksa varsayılan sıra
  const order = summary.layouts?.[question.id] ?? question.options.map((o) => o.id);
  const options = order
    .map((id) => question.options.find((o) => o.id === id))
    .filter((o): o is QuestionOption => !!o);

  const secs = (answer.timeSpentMs / 1000).toFixed(2);
  let status = { text: answer.isCorrect ? r.correct : r.wrong, color: answer.isCorrect ? 'var(--accent-green)' : 'var(--accent-red)', icon: answer.isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} /> };
  if (answer.foul === 'timeout') status = { text: r.timeout, color: 'var(--accent-amber)', icon: <Timer size={22} /> };
  else if (answer.foul === 'guess') status = { text: r.guess, color: 'var(--accent-amber)', icon: <Zap size={22} /> };

  // body'ye taşınır: sonuç sayfasındaki animasyonlu (transform) kutu, position:fixed'i kendi içine hapsediyor
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={r.title}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        padding: '20px 16px',
        background: 'var(--bg-primary)', // sayfanın kendi arka planı
      }}
    >
      {/* Oyundaki soru kartıyla aynı görünüm ve genişlik */}
      <div
        className="glass-panel question-panel animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1120px',
          margin: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Üst satır */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: '1.1rem' }}>{r.counter(index + 1, total)}</strong>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {t.difficulty[question.difficulty]} &bull; {t.categories[question.category] ?? question.category}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={r.close}
            title={r.close}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Görseller — oyundaki gibi */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {options.map((option, idx) => (
            <ImageOption
              key={question.id + option.id}
              option={option}
              label={idx === 0 ? t.game.optionA : t.game.optionB}
              isSelected={answer.selectedOption === option.id}
              isRevealed
              targetAnswer={question.correctAnswer}
              disabled
              onSelect={() => {}}
              maxImageHeight="max(240px, calc(100vh - 360px))"
              showSourceDescription={false}
            />
          ))}
        </div>

        {/* Sonuç */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            flexWrap: 'wrap',
            fontWeight: 700,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: status.color, fontSize: '1.1rem' }}>
            {status.icon} {status.text}
          </span>
          {answer.foul !== 'timeout' && (
            <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{r.time(secs)}</span>
          )}
          <span style={{ color: answer.pointsEarned > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
            {r.points(answer.pointsEarned)}
          </span>
        </div>

        {/* Gezinme */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <Button
            variant="secondary"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            leftIcon={<ChevronLeft size={18} />}
          >
            {r.prev}
          </Button>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            {summary.answers.map((a, i) => (
              <button
                key={a.questionId}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={r.counter(i + 1, total)}
                aria-current={i === index}
                style={{
                  width: i === index ? 22 : 10,
                  height: 10,
                  padding: 0,
                  border: 'none',
                  borderRadius: 999,
                  cursor: 'pointer',
                  transition: 'width 0.2s ease',
                  background: a.isCorrect ? 'var(--accent-green)' : a.foul ? 'var(--accent-amber)' : 'var(--accent-red)',
                  opacity: i === index ? 1 : 0.55,
                }}
              />
            ))}
          </div>

          {index < total - 1 ? (
            <Button variant="primary" onClick={() => setIndex((i) => i + 1)} rightIcon={<ChevronRight size={18} />}>
              {r.next}
            </Button>
          ) : (
            <Button variant="primary" onClick={onClose}>
              {r.close}
            </Button>
          )}
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.keysHint}</div>
      </div>
    </div>,
    document.body,
  );
}
