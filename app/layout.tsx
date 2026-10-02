import type { Metadata } from 'next';
import './globals.css';
import QueueFlusher from '@/components/net/QueueFlusher';

export const metadata: Metadata = {
  title: 'Spot the AI | Yapay Zekayı Yakala',
  description: 'Fotoğraflara dikkatle bak, detayları incele ve hangisinin yapay zekâ tarafından üretildiğini keşfet!',
  keywords: ['ai', 'spot the ai', 'yapay zeka oyunu', 'yapay zeka dedektifi', 'turing testi'],
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
      </body>
    </html>
  );
}
