'use client';

import { useEffect } from 'react';
import { flushQueue } from '@/lib/net/submitRun';

const INTERVAL_MS = 10_000;

/** Layout'ta bir kez render edilir; gönderilemeyen skorları arka planda sessizce gönderir. */
export default function QueueFlusher() {
  useEffect(() => {
    flushQueue();
    const t = setInterval(flushQueue, INTERVAL_MS);
    const onOnline = () => flushQueue();
    window.addEventListener('online', onOnline);
    return () => {
      clearInterval(t);
      window.removeEventListener('online', onOnline);
    };
  }, []);
  return null;
}
