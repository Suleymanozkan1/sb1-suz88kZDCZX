import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Paneli | Dijital Düğün Davetiyesi',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(180deg, #120c06 0%, #0d0805 100%)' }}
    >
      {children}
    </div>
  );
}
