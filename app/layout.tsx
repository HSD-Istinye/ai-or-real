import type { Metadata } from 'next';
import './globals.css';
import QueueFlusher from '@/components/net/QueueFlusher';
import { LangProvider } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Reallusion | Gerçek mi, Yapay mı?',
  description: 'Fotoğraflara dikkatle bak, detayları incele ve hangisinin yapay zekâ tarafından üretildiğini keşfet!',
  keywords: ['ai', 'Reallusion', 'yapay zeka oyunu', 'yapay zeka dedektifi', 'turing testi'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <div className="bg-grid-overlay" />
        {/* Gönderilemeyen skorları arka planda tekrar gönderir (offline kuyruk) */}
        <QueueFlusher />
        <LangProvider>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
          }}
        >
          {children}
        </main>
        </LangProvider>
      </body>
    </html>
  );
}
