'use client';

import { useEffect, useState } from 'react';

interface Issue {
  level: 'engel' | 'oneri';
  message: string;
}

/**
 * Eksik yapılandırmayı, birisi ona çarpmadan önce gösterir.
 *
 * Eksik bir ortam değişkeni kendini hep ilgisiz bir hatayla belli ediyordu:
 * parola doğruyken "parola hatalı", dosya geçerliyken "görsel yüklenemedi".
 * Sebep panelin en üstünde yazılı olduğunda bu tahmin işi ortadan kalkıyor.
 *
 * Engelleyen eksikle yalnızca öneri ayrı gösterilir: ikisi aynı kutuda
 * durunca çalışan bir kurulum bozukmuş gibi okunuyordu.
 */
export default function SetupNotice() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetch('/api/health', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => setIssues(body?.issues ?? []))
      .catch(() => setIssues([]));
  }, []);

  const blocking = issues.filter((issue) => issue.level === 'engel');
  const advisory = issues.filter((issue) => issue.level === 'oneri');
  if (issues.length === 0) return null;

  return (
    <div className="mt-[var(--sp-md)] space-y-[var(--sp-xs)]">
      {blocking.length > 0 && (
        <section
          className="px-5 py-[var(--sp-sm)]"
          style={{
            border: '1px solid rgba(226, 163, 163, 0.35)',
            background: 'rgba(226, 163, 163, 0.06)',
          }}
        >
          <p className="t-label" style={{ color: '#e2a3a3' }}>
            Kurulum eksik
          </p>
          <ul className="mt-3 space-y-1.5">
            {blocking.map((issue) => (
              <li key={issue.message} className="t-body" style={{ color: 'var(--c-on-dark-soft)' }}>
                {issue.message}
              </li>
            ))}
          </ul>
          <p className="t-body mt-3" style={{ color: 'var(--c-on-dark-faint)' }}>
            Vercel’de Storage bölümünden bağladıktan sonra <strong>Redeploy</strong> etmeyi
            unutmayın — mevcut dağıtım yeni değişkenleri görmez.
          </p>
        </section>
      )}

      {advisory.length > 0 && (
        <section
          className="px-5 py-[var(--sp-sm)]"
          style={{
            border: '1px solid rgba(176, 141, 63, 0.28)',
            background: 'rgba(176, 141, 63, 0.05)',
          }}
        >
          <p className="t-label" style={{ color: 'var(--c-gold)' }}>
            Öneri
          </p>
          <ul className="mt-3 space-y-1.5">
            {advisory.map((issue) => (
              <li key={issue.message} className="t-body" style={{ color: 'var(--c-on-dark-soft)' }}>
                {issue.message}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
