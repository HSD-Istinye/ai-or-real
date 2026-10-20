'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, BadgeCheck, Eye, Sparkles, Timer, Trophy } from 'lucide-react';
import Button from '@/components/ui/Button';
import { LangToggle, useT } from '@/lib/i18n';
import { QUESTION_MIX } from '@/lib/game/rules';

const FEATURE_ICONS = [Eye, Timer, BadgeCheck];
const ROUNDS = Object.values(QUESTION_MIX).reduce((a, b) => a + b, 0);

export default function HomePage() {
  const t = useT();
  const h = t.home;
  return (
    <div className="home-page">
      <header className="home-nav">
        <Link href="/" className="home-brand" aria-label={h.brandAria}>
          <span className="home-brand-mark"><Sparkles size={19} /></span>
          <span>spot the <strong>ai</strong></span>
        </Link>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span className="home-nav-note">{h.navNote}</span>
          <LangToggle />
        </span>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <div className="home-kicker"><span /> {h.kicker}</div>
          <h1 id="home-title">{h.title1}<br /><span>{h.title2}</span></h1>
          <p className="home-intro">{h.intro}</p>
          <div className="home-actions">
            <Link href="/start" className="home-play-link">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={19} />}>
                {h.play}
              </Button>
            </Link>
            <span className="home-time-note"><Timer size={15} /> {h.timeNote(ROUNDS)}</span>
            <Link href="/leaderboard" className="home-how-link" style={{ marginTop: 0 }}>
              <Trophy size={15} /> {h.leaderboard}
            </Link>
          </div>
          <a className="home-how-link" href="#nasil-oynanir">
            {h.how} <ArrowDown size={15} />
          </a>
        </div>

        <div className="home-demo" aria-label={h.demoAria}>
          <div className="home-demo-topline">
            <span><span className="home-live-dot" /> {h.demoTop}</span>
            <span>01 / {String(ROUNDS).padStart(2, '0')}</span>
          </div>
          <h2>{t.whichIsAi}</h2>
          <div className="home-demo-images">
            <div className="home-demo-image">
              <Image src="/images/questions/Q001/real.webp" alt={h.altA} fill priority sizes="(max-width: 760px) 45vw, 260px" />
              <span className="home-image-label">A</span>
            </div>
            <div className="home-demo-image">
              <Image src="/images/questions/Q001/ai.webp" alt={h.altB} fill priority sizes="(max-width: 760px) 45vw, 260px" />
              <span className="home-image-label">B</span>
            </div>
          </div>
          <div className="home-demo-hint"><Sparkles size={15} /> {h.demoHint}</div>
          <div className="home-demo-stamp">{h.stamp1}<br /><strong>{h.stamp2}</strong></div>
        </div>
      </section>

      <section className="home-features" id="nasil-oynanir" aria-label={h.featuresAria}>
        {h.features.map(({ eyebrow, title, description }, index) => {
          const Icon = FEATURE_ICONS[index];
          return (
          <article className="home-feature" key={index}>
            <div className="home-feature-head">
              <span className="home-feature-icon"><Icon size={19} /></span>
              <span className="home-feature-number">0{index + 1}</span>
            </div>
            <span className="home-feature-eyebrow">{eyebrow}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
          );
        })}
      </section>

      <footer className="home-footer">
        <span>SPOT THE AI</span>
        <span>{h.footer}</span>
      </footer>
    </div>
  );
}
