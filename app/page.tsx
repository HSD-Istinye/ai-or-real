'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Play, Sparkles, Target, Zap, ShieldCheck } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div
      style={{
        maxWidth: '900px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '40px',
        padding: '40px 20px',
      }}
    >
      {/* Top Floating Badge */}
      <div
        className="animate-float"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 18px',
          borderRadius: '999px',
          backgroundColor: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          color: 'var(--accent-cyan)',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)',
        }}
      >
        <Sparkles size={16} />
        <span>Görsel Algı & Turing Mücadelesi</span>
      </div>

      {/* Hero Title & Subtitle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '750px' }}>
        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          Hangisi Gerçek, Hangisi{' '}
          <span className="gradient-text-cyan">Yapay Zekâ?</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            fontWeight: 400,
          }}
        >
          Yapay zekâ modelleri gerçeğe o kadar yaklaştı ki ayırt etmek artık bir sanat.
          İki fotoğraf arasındaki ince hataları yakala, gözlem yeteneğini test et!
        </p>
      </div>

      {/* CTA Button */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/game" style={{ textDecoration: 'none' }}>
          <Button
            variant="primary"
            size="lg"
            leftIcon={<Play size={22} fill="currentColor" />}
            style={{ fontSize: '1.2rem', padding: '16px 40px' }}
          >
            Meydan Okumaya Başla
          </Button>
        </Link>
      </div>

      {/* Feature Highlights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          width: '100%',
          marginTop: '20px',
          textAlign: 'left',
        }}
      >
        {/* Card 1 */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)',
              marginBottom: '16px',
            }}
          >
            <Target size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            İnce Kusurları Yakala
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Göz bebeklerindeki yansımalar, bükülen perspektif çizgileri ve saç sınırları en büyük
            ipuçlarındır.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-purple)',
              marginBottom: '16px',
            }}
          >
            <Zap size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            Seri & Süre Bonusu
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Ardı ardına doğru bildikçe puan çarpanın artar. Hızlı kararlar ekstra hız puanı kazandırır.
          </p>
        </div>

        {/* Card 3 */}
        <div className="glass-panel glass-panel-interactive" style={{ padding: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-green)',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
            Dedektif Unvanı Kazan
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Oyun sonunda doğruluk oranına göre özel siber dedektiflik rozetlerini ve unvanlarını topla.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: '40px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Bot size={16} />
        <span>Spot the AI &bull; Yapay Zekâ Görsel Algılama Simülasyonu</span>
      </footer>
    </div>
  );
}
