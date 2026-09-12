/** "2026-02-14" → "14 Şubat 2026" */
export function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** "2026-02-14" → "Cumartesi" */
export function formatWeekday(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('tr-TR', { weekday: 'long' });
}

/** Geri sayımın hedefi: tarih + saat. */
export function targetDate(date: string | undefined, time: string | undefined): string {
  if (!date) return '';
  return `${date}T${time && /^\d{2}:\d{2}$/.test(time) ? time : '00:00'}:00`;
}

/** Google Takvim / .ics bağlantıları için "20260214T150000" biçimi. */
export function calendarStamp(date: string | undefined, time: string | undefined): string {
  if (!date) return '';
  const [h = '00', m = '00'] = (time ?? '').split(':');
  return `${date.replace(/-/g, '')}T${h.padStart(2, '0')}${m.padStart(2, '0')}00`;
}

/**
 * Bitiş zamanı.
 *
 * Çift artık bitiş saatini kendisi seçiyor; verilmediyse eskisi gibi
 * başlangıçtan beş saat sonrası varsayılır. Bitiş başlangıçtan önceyse
 * (23:00 → 02:00 gibi gece yarısını aşan düğünler) ertesi güne taşınır,
 * yoksa takvim kaydı negatif süreyle oluşuyordu.
 */
export function calendarEndStamp(
  date: string | undefined,
  time: string | undefined,
  endTime?: string | undefined,
): string {
  if (!date) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const [bh = '0', bm = '0'] = (time ?? '').split(':');
  const end = new Date(`${date}T00:00:00`);

  if (endTime && /^\d{1,2}:\d{2}$/.test(endTime)) {
    const [eh, em] = endTime.split(':').map(Number);
    const gunAsimi = eh * 60 + em <= Number(bh) * 60 + Number(bm) ? 1 : 0;
    end.setDate(end.getDate() + gunAsimi);
    end.setHours(eh, em);
  } else {
    end.setHours(Number(bh) + 5, Number(bm));
  }

  return (
    `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}` +
    `T${pad(end.getHours())}${pad(end.getMinutes())}00`
  );
}

/** "17:00" + "23:00" → "17:00 – 23:00"; bitiş yoksa yalnızca başlangıç. */
export function formatTimeRange(
  start: string | undefined,
  end: string | undefined,
): string {
  const b = start?.trim();
  if (!b) return '';
  const s = end?.trim();
  return s && s !== b ? `${b} – ${s}` : b;
}
