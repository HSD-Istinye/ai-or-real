'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowRight, BadgeCheck, Eye, Sparkles, Timer } from 'lucide-react';
import Button from '@/components/ui/Button';

const features = [
  {
    icon: Eye,
    eyebrow: 'GÖZLEM',
    title: 'Detaylara dikkat et',
    description: 'Işık, doku ve perspektif… Cevap çoğu zaman küçük bir ayrıntıda saklı.',
  },
  {
    icon: Timer,
    eyebrow: 'TEMPO',
    title: 'Kendi ritminde oyna',
    description: 'Her turda iki görseli incele, kararını ver ve bir sonraki soruya geç.',
  },
  {
    icon: BadgeCheck,
    eyebrow: 'SONUÇ',
    title: 'Dedektifliğini keşfet',
    description: 'Puanını, doğru cevaplarını ve oyun sonunda kazandığın unvanı gör.',
  },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="home-nav">
        <Link href="/" className="home-brand" aria-label="Spot the AI ana sayfa">
          <span className="home-brand-mark"><Sparkles size={19} /></span>
          <span>spot the <strong>ai</strong></span>
        </Link>
        <span className="home-nav-note">Görsel algı oyunu</span>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <div className="home-kicker"><span /> GÖZÜNE GÜVENİYOR MUSUN?</div>
          <h1 id="home-title">Gerçeği bul.<br /><span>Yapay zekâyı yakala.</span></h1>
          <p className="home-intro">
            İki görsel, tek doğru cevap. Ayrıntılara bak, sezgini kullan ve hangisinin yapay zekâ
            tarafından üretildiğini bul.
          </p>
          <div className="home-actions">
            <Link href="/game" className="home-play-link">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={19} />}>
                Oyuna başla
              </Button>
            </Link>
            <span className="home-time-note"><Timer size={15} /> 3 tur · Ücretsiz</span>
          </div>
          <a className="home-how-link" href="#nasil-oynanir">
            Nasıl oynanır? <ArrowDown size={15} />
          </a>
        </div>

        <div className="home-demo" aria-label="İki görselden hangisinin yapay zekâ tarafından üretildiğini bul">
          <div className="home-demo-topline">
            <span><span className="home-live-dot" /> GÖRSEL TESTİ</span>
            <span>01 / 03</span>
          </div>
          <h2>Hangisi yapay zekâ?</h2>
          <div className="home-demo-images">
            <div className="home-demo-image">
              <Image src="/images/questions/Q001/real.webp" alt="Karşılaştırma için portre fotoğrafı A" fill priority sizes="(max-width: 760px) 45vw, 260px" />
              <span className="home-image-label">A</span>
            </div>
            <div className="home-demo-image">
              <Image src="/images/questions/Q001/ai.webp" alt="Karşılaştırma için portre fotoğrafı B" fill priority sizes="(max-width: 760px) 45vw, 260px" />
              <span className="home-image-label">B</span>
            </div>
          </div>
          <div className="home-demo-hint"><Sparkles size={15} /> Oyunda birini seç, cevabı hemen öğren.</div>
          <div className="home-demo-stamp">BİR BAKIŞTA<br /><strong>ANLAŞILMAZ.</strong></div>
        </div>
      </section>

      <section className="home-features" id="nasil-oynanir" aria-label="Oyun özellikleri">
        {features.map(({ icon: Icon, eyebrow, title, description }, index) => (
          <article className="home-feature" key={eyebrow}>
            <div className="home-feature-head">
              <span className="home-feature-icon"><Icon size={19} /></span>
              <span className="home-feature-number">0{index + 1}</span>
            </div>
            <span className="home-feature-eyebrow">{eyebrow}</span>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <footer className="home-footer">
        <span>SPOT THE AI</span>
        <span>İnsan gözü mü, yapay zekâ mı?</span>
      </footer>
    </div>
  );
}
