'use client';

import { useEffect, useState } from 'react';

/**
 * Eksik yapılandırmayı, birisi ona çarpmadan önce gösterir.
 *
 * Eksik bir ortam değişkeni kendini hep ilgisiz bir hatayla belli ediyordu:
 * parola doğruyken "parola hatalı", dosya geçerliyken "görsel yüklenemedi".
 * Sebep panelin en üstünde yazılı olduğunda bu tahmin işi ortadan kalkıyor.
 */
export default function SetupNotice() {
  const [issues, setIssues] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => setIssues(body?.issues ?? []))
      .catch(() => setIssues([]));
  }, []);

  if (issues.length === 0) return null;

  return (
    <section
      className="mt-[var(--sp-md)] px-5 py-[var(--sp-sm)]"
      style={{ border: '1px solid rgba(226, 163, 163, 0.35)', background: 'rgba(226, 163, 163, 0.06)' }}
    >
      <p className="t-label" style={{ color: '#e2a3a3' }}>
        Kurulum eksik
      </p>
      <ul className="mt-3 space-y-1.5">
        {issues.map((issue) => (
          <li key={issue} className="t-body" style={{ color: 'var(--c-on-dark-soft)' }}>
            {issue}
          </li>
        ))}
      </ul>
      <p className="t-body mt-3" style={{ color: 'var(--c-on-dark-faint)' }}>
        Vercel’de Storage bölümünden Postgres ve Blob oluşturup projeye bağlayın, ardından
        yeniden dağıtın.
      </p>
    </section>
  );
}
