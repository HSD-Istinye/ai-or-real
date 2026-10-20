'use client';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, ExternalLink, RefreshCw } from 'lucide-react';
import { LangToggle, useLang } from '@/lib/i18n';
import { startAccessPolling } from '@/lib/net/accessPolling';

type Session = { qr: string; url: string; expiresAt: number; unlocked: boolean };
export default function AccessScreen() {
  const { lang } = useLang();
  const en = lang === 'en';
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(true);
  const initial = useRef<Promise<Session> | null>(null);
  const create = async () => {
    const response = await fetch('/api/access', { method: 'POST', cache: 'no-store' });
    if (!response.ok) throw new Error('access');
    return response.json() as Promise<Session>;
  };
  const accept = (data: Session) => {
    if (data.unlocked) window.location.replace('/');
    else setSession(data);
  };
  const renew = async () => {
    setBusy(true); setError(false);
    try { accept(await create()); } catch { setError(true); } finally { setBusy(false); }
  };
  useEffect(() => {
    let active = true;
    initial.current ??= create();
    initial.current.then(data => { if (active) accept(data); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!session) return;
    const polling = startAccessPolling({
      visible: () => !document.hidden,
      check: async (signal) => {
        const res = await fetch('/api/access', { cache: 'no-store', signal });
        if (!res.ok) throw new Error('status');
        return (await res.json()).unlocked === true;
      },
      onError: setError,
      onUnlocked: () => window.location.replace('/'),
    });
    const onVisibility = () => document.hidden ? polling.pause() : polling.resume();
    const onReturn = () => { if (!document.hidden) polling.resume(); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pageshow', onReturn);
    window.addEventListener('online', onReturn);
    return () => {
      polling.stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pageshow', onReturn);
      window.removeEventListener('online', onReturn);
    };
  }, [session]);
  return (
    <section className="glass-panel access-screen">
      <div className="access-heading"><span><Sparkles size={23} /> Reallusion</span><LangToggle /></div>
      <h1>{en ? 'One scan before you play' : 'Oyundan önce bir QR'}</h1>
      <p>{en ? 'Scan the code and open the link to visit HSD İstinye. This game screen will unlock automatically.' : 'QR kodunu okut ve bağlantıyı aç. HSD İstinye sayfasına yönlendirilirken bu ekranda oyun erişimi otomatik açılacak.'}</p>
      <div className="access-qr" aria-busy={busy}>
        {session && !busy ? <img src={session.qr} width={320} height={320} alt={en ? 'Scan to unlock this game session' : 'Bu oyun oturumunu açmak için QR kodu'} />
          : <span>{en ? 'Preparing QR…' : 'QR hazırlanıyor…'}</span>}
      </div>
      {session && <>
        <span className="access-target">linktr.ee/hsdistinye</span>
        <a className="btn btn-primary" href={session.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={18} />{en ? 'Open on this phone' : 'Bu telefonda bağlantıyı aç'}
        </a>
        <p className="access-note">{en ? 'On a phone? Open the link, then return to this tab. QR codes expire after 15 minutes.' : 'Telefondaysan bağlantıyı açtıktan sonra bu sekmeye dön. QR kodu 15 dakika geçerlidir.'}</p>
      </>}
      <div role="status" className="access-note">{error
        ? (en ? 'Connection failed. Please try again.' : 'Bağlantı kurulamadı. Lütfen tekrar dene.')
        : (session ? (en ? 'Waiting for the link to open…' : 'Bağlantının açılması bekleniyor…') : '')}</div>
      <button className="btn btn-secondary" onClick={renew} disabled={busy}>
        <RefreshCw size={16} />{en ? 'Create a new QR' : 'Yeni QR oluştur'}
      </button>
    </section>
  );
}
