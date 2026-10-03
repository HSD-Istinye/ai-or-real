'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GameHeader } from '@/components/game/GameHeader';
import { QuestionCard } from '@/components/game/QuestionCard';
import { TimerBar } from '@/components/game/TimerBar';
import { RoundFeedback } from '@/components/game/RoundFeedback';
import { createGame } from '@/lib/game/createGame';
import { checkAnswer } from '@/lib/game/checkAnswer';
import { generateGameSummary } from '@/lib/game/calculateScore';
import { FEEDBACK_MS, randomWaitMs, timeLimitFor } from '@/lib/game/rules';
import { preloadImages, reactionMs, revealOnNextFrame, sideFromKey } from '@/lib/game/timing';
import { newId } from '@/lib/net/uuid';
import { getPlayerNick } from '@/lib/player';
import { GameState, PlayerAnswer, RoundPhase } from '@/types/game';
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

/**
 * Süreli (refleks) oyun ekranı.
 *
 * Her tur:  loading → wait → live → feedback → (sonraki tur)
 *  - loading : görseller arka planda indirilip çözülür (süreye eklenmesin)
 *  - wait    : "Hazır ol…" — rastgele 0.8–2 sn; bu sırada tuşa basmak "Çok erken!"
 *  - live    : iki görsel aynı karede belirir, t0 kilitlenir, süre çubuğu akar
 *  - feedback: sonuç ~1.8 sn gösterilir, sonra otomatik geçilir (Enter/Boşluk ile atlanır)
 *
 * Kontrol: fare (görsele bas) veya klavye (← / A = sol, → / L = sağ).
 * Zamanlama mantığı React state'inde değil ref'lerde tutulur; yeniden çizim ölçümü etkilemez.
 */
export default function GamePage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<RoundPhase>('loading');
  const [selectedOption, setSelectedOption] = useState<OptionType | null>(null);
  const [lastAnswer, setLastAnswer] = useState<PlayerAnswer | null>(null);
  const [tooEarly, setTooEarly] = useState(false);

  const soundRef = useRef<SoundEffects | null>(null);
  const nickRef = useRef<string | null>(null);
  const imagesRef = useRef<HTMLDivElement>(null);

  // Zamanlama durumu (render dışında)
  const gameRef = useRef<GameState | null>(null);
  const phaseRef = useRef<RoundPhase>('loading');
  const t0Ref = useRef<number | null>(null);
  const timers = useRef<number[]>([]);
  const cancelReveal = useRef<(() => void) | null>(null);

  gameRef.current = gameState;

  const go = (p: RoundPhase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
    cancelReveal.current?.();
    cancelReveal.current = null;
  };

  // Oyunu başlat — isim girilmeden oyun başlamaz
  useEffect(() => {
    const nick = getPlayerNick();
    if (!nick) {
      router.replace('/start');
      return;
    }
    nickRef.current = nick;
    soundRef.current = new SoundEffects();
    setGameState(createGame());
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  /* ───────────── tur akışı ───────────── */

  const finishRound = useCallback((option: OptionType | null, ms: number | null) => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== 'live') return;
    clearTimers();
    go('feedback');

    const question = g.questions[g.currentIndex];
    const answer = checkAnswer({ question, selectedOption: option, timeSpentMs: ms, currentStreak: g.streak });

    if (option) soundRef.current?.playSelect();
    if (answer.isCorrect) soundRef.current?.playCorrect();
    else soundRef.current?.playIncorrect();

    setSelectedOption(option);
    setLastAnswer(answer);
    setGameState((prev) =>
      prev && {
        ...prev,
        score: prev.score + answer.pointsEarned,
        streak: answer.streakAtAnswer,
        maxStreak: Math.max(prev.maxStreak, answer.streakAtAnswer),
        answers: [...prev.answers, answer],
        status: 'answered',
      },
    );
    later(nextRound, FEEDBACK_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goLive = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const limit = timeLimitFor(g.questions[g.currentIndex]);
    cancelReveal.current = revealOnNextFrame(imagesRef.current, (t0) => {
      t0Ref.current = t0;
      go('live');
      later(() => finishRound(null, null), limit); // süre doldu
    });
  }, [finishRound]);

  const beginWait = useCallback(() => {
    go('wait');
    later(goLive, randomWaitMs());
  }, [goLive]);

  const nextRound = useCallback(() => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== 'feedback') return;
    clearTimers();
    const isLast = g.currentIndex >= g.questions.length - 1;
    if (isLast) {
      const summary = {
        ...generateGameSummary(g),
        runId: newId(), // leaderboard kaydı için — sonuç ekranında otomatik gönderilir
        nick: nickRef.current ?? undefined,
        playedAt: new Date().toISOString(),
      };
      sessionStorage.setItem('spot_the_ai_result', JSON.stringify(summary));
      phaseRef.current = 'loading';
      router.push('/result');
      return;
    }
    setGameState((prev) => prev && { ...prev, currentIndex: prev.currentIndex + 1, status: 'playing' });
  }, [router]);

  // Her yeni soruda: görselleri gizle → önceden yükle → bekleme
  const roundIndex = gameState?.currentIndex ?? -1;
  const ready = !!gameState && gameState.questions.length > 0;
  useEffect(() => {
    if (!ready) return;
    const g = gameRef.current!;
    const q = g.questions[g.currentIndex];
    let cancelled = false;

    clearTimers();
    t0Ref.current = null;
    if (imagesRef.current) imagesRef.current.style.visibility = 'hidden';
    setSelectedOption(null);
    setLastAnswer(null);
    setTooEarly(false);
    go('loading');

    preloadImages(q.options.map((o) => o.imageUrl)).then(() => {
      if (!cancelled) beginWait();
    });
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [roundIndex, ready, beginWait]);

  /* ───────────── giriş: klavye + fare ───────────── */

  const tooEarlyPress = useCallback(() => {
    clearTimers();
    setTooEarly(true);
    soundRef.current?.playIncorrect();
    later(() => {
      setTooEarly(false);
      beginWait(); // bekleme baştan, yeni rastgele süreyle
    }, 900);
  }, [beginWait]);

  const answerSide = useCallback(
    (side: 0 | 1, eventTimeStamp: number) => {
      const g = gameRef.current;
      if (!g) return;
      if (phaseRef.current === 'wait') return tooEarlyPress();
      if (phaseRef.current !== 'live' || t0Ref.current === null) return;
      const option = g.questions[g.currentIndex].options[side]?.id ?? null;
      finishRound(option, reactionMs(eventTimeStamp, t0Ref.current));
    },
    [finishRound, tooEarlyPress],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      // Sonuç gösterilirken Enter / Boşluk → hemen sonraki tura geç
      if ((e.code === 'Enter' || e.code === 'Space') && phaseRef.current === 'feedback') {
        e.preventDefault();
        nextRound();
        return;
      }
      const side = sideFromKey(e);
      if (side === null) return;
      e.preventDefault();
      answerSide(side, e.timeStamp);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answerSide, nextRound]);

  /* ───────────── görünüm ───────────── */

  if (!gameState || gameState.questions.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>Oyun hazırlanıyor...</p>
      </div>
    );
  }

  const currentQuestion = gameState.questions[gameState.currentIndex];
  const limit = timeLimitFor(currentQuestion);
  const isRevealed = phase === 'feedback';
  const imagesVisible = phase === 'live' || phase === 'feedback';

  let overlay: React.ReactNode = null;
  if (phase === 'loading' || phase === 'wait') {
    overlay = (
      <div
        className={tooEarly ? 'animate-pop-in' : undefined}
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          color: tooEarly ? 'var(--accent-red)' : 'var(--text-primary)',
        }}
      >
        <div style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800 }}>
          {tooEarly ? 'Çok erken!' : phase === 'loading' ? 'Hazırlanıyor…' : 'Hazır ol…'}
        </div>
        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
          {tooEarly
            ? 'Görseller belirmeden basma'
            : `${(limit / 1000).toFixed(0)} saniyen var · Fare ile seç ya da ← / → tuşları`}
        </div>
      </div>
    );
  } else if (phase === 'feedback' && lastAnswer) {
    overlay = (
      <div style={{ alignSelf: 'center' }}>
        <RoundFeedback answer={lastAnswer} />
      </div>
    );
  }

  return (
    <div
      className="game-shell"
      style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        margin: '0 auto',
      }}
    >
      <GameHeader
        currentIndex={gameState.currentIndex}
        totalQuestions={gameState.questions.length}
        score={gameState.score}
        streak={gameState.streak}
      />

      <QuestionCard
        question={currentQuestion}
        selectedOption={selectedOption}
        isRevealed={isRevealed}
        onSelectOption={(optionId, ts) => {
          const side = currentQuestion.options.findIndex((o) => o.id === optionId);
          if (side === 0 || side === 1) answerSide(side, ts);
        }}
        imagesRef={imagesRef}
        imagesVisible={imagesVisible}
        overlay={overlay}
        compact
        topSlot={
          <TimerBar
            roundKey={currentQuestion.id + gameState.currentIndex}
            durationMs={limit}
            running={phase === 'live'}
            visible={imagesVisible}
          />
        }
      />
    </div>
  );
}
