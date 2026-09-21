'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GameHeader } from '@/components/game/GameHeader';
import { QuestionCard } from '@/components/game/QuestionCard';
import { AnswerFeedback } from '@/components/game/AnswerFeedback';
import { createGame } from '@/lib/game/createGame';
import { checkAnswer } from '@/lib/game/checkAnswer';
import { generateGameSummary } from '@/lib/game/calculateScore';
import { GameState, PlayerAnswer } from '@/types/game';
import { OptionType } from '@/types/question';

// Web Audio synthesizer for zero-dependency sound effects
class SoundEffects {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playSelect() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted
    }
  }

  playCorrect() {
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.25);
      });
    } catch {
      // Audio context error ignore
    }
  }

  playIncorrect() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(130, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {
      // Audio context error ignore
    }
  }
}

export default function GamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [lastAnswer, setLastAnswer] = useState<PlayerAnswer | null>(null);
  const soundRef = useRef<SoundEffects | null>(null);

  // Initialize game on mount
  useEffect(() => {
    soundRef.current = new SoundEffects();
    const freshGame = createGame();
    setGameState(freshGame);
  }, []);

  if (!gameState || gameState.questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Oyun hazırlanıyor...</p>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentIndex];
  const isRevealed = gameState.status === 'answered';
  const isLastQuestion = gameState.currentIndex === gameState.questions.length - 1;

  // Player clicks an option (A or B)
  const handleSelectOption = (optionId: OptionType) => {
    if (gameState.status !== 'playing') return;

    soundRef.current?.playSelect();
    setSelectedOption(optionId);

    const timeSpent = gameState.questionStartTime
      ? Date.now() - gameState.questionStartTime
      : 3000;

    const answer = checkAnswer({
      question: currentQuestion,
      selectedOption: optionId,
      timeSpentMs: timeSpent,
      currentStreak: gameState.streak,
    });

    if (answer.isCorrect) {
      soundRef.current?.playCorrect();
    } else {
      soundRef.current?.playIncorrect();
    }

    setLastAnswer(answer);

    const updatedScore = gameState.score + answer.pointsEarned;
    const updatedStreak = answer.streakAtAnswer;
    const updatedMaxStreak = Math.max(gameState.maxStreak, updatedStreak);

    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        score: updatedScore,
        streak: updatedStreak,
        maxStreak: updatedMaxStreak,
        answers: [...prev.answers, answer],
        status: 'answered',
      };
    });
  };

  // Move to next question or show results
  const handleNext = () => {
    if (isLastQuestion) {
      // Calculate final summary and persist in sessionStorage
      const summary = generateGameSummary(gameState);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('spot_the_ai_result', JSON.stringify(summary));
      }
      router.push('/result');
    } else {
      setSelectedOption(null);
      setLastAnswer(null);
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1,
          status: 'playing',
          questionStartTime: Date.now(),
        };
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        margin: '0 auto',
      }}
    >
      {/* Top Game Header */}
      <GameHeader
        currentIndex={gameState.currentIndex}
        totalQuestions={gameState.questions.length}
        score={gameState.score}
        streak={gameState.streak}
      />

      {/* Main Question & Cards */}
      <QuestionCard
        question={currentQuestion}
        selectedOption={selectedOption}
        isRevealed={isRevealed}
        onSelectOption={handleSelectOption}
      />

      {/* Answer Feedback Banner */}
      {isRevealed && lastAnswer && (
        <AnswerFeedback
          isCorrect={lastAnswer.isCorrect}
          pointsEarned={lastAnswer.pointsEarned}
          explanation={currentQuestion.explanation}
          aiClues={currentQuestion.aiClues}
          isLastQuestion={isLastQuestion}
          onNext={handleNext}
        />
      )}
    </div>
  );
}
