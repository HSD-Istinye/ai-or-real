'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Home,
  UserPlus,
  Trophy,
  CheckCircle2,
  Flame,
  Award,
  ListChecks,
  Images,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { GameSummary } from '@/types/game';
import RunResult from '@/components/leaderboard/RunResult';
import { clearPlayerNick } from '@/lib/player';
import AnswerReview from '@/components/result/AnswerReview';
import { useT } from '@/lib/i18n';

export default function ResultPage() {
  const router = useRouter();
  const t = useT();
  const [summary, setSummary] = useState<GameSummary | null>(null);
  // "Cevapları gör" açıkken hangi sorudan başlandığı; null = kapalı
  const [reviewAt, setReviewAt] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('spot_the_ai_result');
      if (saved) {
        try {
          const parsed: GameSummary = JSON.parse(saved);
          setSummary(parsed);

          // Trigger confetti celebration if score is good
          if (parsed.accuracyPercentage >= 50) {
            confetti({
              particleCount: 36,
              spread: 58,
              origin: { y: 0.6 },
              colors: ['#a96340', '#4d745c', '#c6a878'],
            });
          }
        } catch {
          // ignore parsing error
        }
      } else {
        // Fallback default if accessed directly
        setSummary({
          totalQuestions: 3,
          correctCount: 3,
          accuracyPercentage: 100,
          totalScore: 450,
          maxStreak: 3,
          rankKey: 'detective',
          answers: [],
        });
      }
    }
  }, []);

  if (!summary) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>{t.result.loading}</p>
      </div>
    );
  }

  // Aynı oyuncu tekrar oynar (isim korunur)
  const handleRestart = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('spot_the_ai_result');
    }
    router.push('/game');
  };

  // Sıradaki oyuncu: isim sıfırlanır, isim ekranına gidilir
  const handleNewPlayer = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('spot_the_ai_result');
    }
    clearPlayerNick();
    router.push('/start');
  };

  return (
    <div
          className="result-page animate-pop-in"
      style={{
        maxWidth: '800px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        padding: '30px 16px',
        margin: '0 auto',
      }}
    >
      {/* Rank Header Card */}
      <div
        className="glass-panel result-rank-card"
        style={{
          width: '100%',
          padding: '36px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 0 35px rgba(0, 240, 255, 0.15)',
        }}
      >
        <div
          className="result-rank-badge"
          style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '4px' }}
        >
          <Award size={35} strokeWidth={1.5} color="var(--accent-cyan)" />
        </div>

        <span
          className="result-overline"
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--accent-cyan)',
          }}
        >
          {t.result.overline}
        </span>

        <h1
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          <span className="gradient-text-cyan">{t.ranks[summary.rankKey ?? 'novice'].title}</span>
        </h1>

        <p
          style={{
            maxWidth: '520px',
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {t.ranks[summary.rankKey ?? 'novice'].description}
        </p>
      </div>

      {/* Liderlik tablosu: skor otomatik kaydedilir, oyuncunun satırı vurgulanır */}
      <RunResult summary={summary} />

      {/* Stats Cards Grid */}
      <div
        className="result-stats"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          width: '100%',
        }}
      >
        {/* Total Score */}
        <div
          className="glass-panel result-stat"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Trophy size={24} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.result.totalScore}
          </span>
          <span
            style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)' }}
          >
            {summary.totalScore}
          </span>
        </div>

        {/* Accuracy */}
        <div
          className="glass-panel result-stat"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Award size={24} color="var(--accent-purple)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.result.accuracy}
          </span>
          <span
            style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)' }}
          >
            {t.percent(summary.accuracyPercentage)}
          </span>
        </div>

        {/* Correct Answers */}
        <div
          className="glass-panel result-stat"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <CheckCircle2 size={24} color="var(--accent-green)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.result.correctTotal}
          </span>
          <span
            style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            {summary.correctCount} / {summary.totalQuestions}
          </span>
        </div>

        {/* Max Streak */}
        <div
          className="glass-panel result-stat"
          style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Flame size={24} color="var(--accent-purple)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {t.result.longestStreak}
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)' }}>
            {summary.maxStreak}x
          </span>
        </div>
      </div>

      {/* Answer History Details */}
      {summary.answers && summary.answers.length > 0 && (
        <div
          className="glass-panel result-history"
          style={{
            width: '100%',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-primary)',
              }}
            >
              <ListChecks size={18} color="var(--accent-cyan)" />
              <span>{t.result.details}</span>
            </h3>
            <Button variant="primary" size="sm" onClick={() => setReviewAt(0)} leftIcon={<Images size={16} />}>
              {t.result.reviewOpen}
            </Button>
          </div>

        </div>
      )}

      {/* Action Buttons */}
      <div className="result-actions" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={handleRestart}
          leftIcon={<RotateCcw size={20} />}
        >
          {t.result.playAgain}
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleNewPlayer}
          leftIcon={<UserPlus size={20} />}
        >
          {t.result.newPlayer}
        </Button>

        <Link href="/" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" size="lg" leftIcon={<Home size={20} />}>
            {t.result.home}
          </Button>
        </Link>
      </div>

      {reviewAt !== null && (
        <AnswerReview summary={summary} startIndex={reviewAt} onClose={() => setReviewAt(null)} />
      )}
    </div>
  );
}
