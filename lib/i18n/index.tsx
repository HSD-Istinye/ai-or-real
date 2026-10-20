'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { dict, Dict, Lang } from './dict';

export type { Lang, Dict };

const KEY = 'hsd_lang';

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangState>({ lang: 'tr', setLang: () => {} });

/**
 * Seçili dil. localStorage'da tutulur; oyuncu değişse de stantta son seçilen dil kalır.
 * Sunucu tarafında sayfa Türkçe çizilir, tarayıcıda kayıtlı dil varsa hemen ona geçer.
 */
export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === 'tr' || saved === 'en') setLangState(saved);
    } catch {
      /* depolama kapalı — Türkçe devam */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {
      /* yoksay */
    }
  }, []);

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

/** Altındaki her şeyi sabit bir dilde gösterir (TV liderlik ekranı, admin paneli Türkçe kalsın diye). */
export function FixedLang({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext.Provider value={{ lang, setLang: () => {} }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function useT(): Dict {
  return dict[useContext(LangContext).lang];
}

/** TR / EN düğmesi */
export function LangToggle({ style }: { style?: React.CSSProperties }) {
  const { lang, setLang } = useLang();
  const t = dict[lang];
  const btn = (l: Lang): React.CSSProperties => ({
    padding: '5px 12px',
    border: 'none',
    borderRadius: 999,
    fontFamily: 'inherit',
    fontSize: '0.8rem',
    fontWeight: 800,
    letterSpacing: '0.06em',
    cursor: 'pointer',
    background: lang === l ? 'var(--accent-cyan)' : 'transparent',
    color: lang === l ? '#fff' : 'var(--text-secondary)',
  });
  return (
    <div
      role="group"
      aria-label={t.lang.label}
      style={{
        display: 'inline-flex',
        gap: 2,
        padding: 3,
        borderRadius: 999,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        ...style,
      }}
    >
      {(['tr', 'en'] as const).map((l) => (
        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} style={btn(l)}>
          {t.lang[l]}
        </button>
      ))}
    </div>
  );
}
