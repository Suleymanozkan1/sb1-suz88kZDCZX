import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Davetiyelerim | Dijital Düğün Davetiyesi',
  robots: { index: false, follow: false },
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: 'linear-gradient(180deg, var(--c-ink) 0%, var(--c-night) 60%)' }}
    >
      <div className="grain" aria-hidden />
      {children}
    </div>
  );
}
