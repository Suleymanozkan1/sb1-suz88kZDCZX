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

/** Bitiş zamanı: başlangıçtan 5 saat sonra. */
export function calendarEndStamp(date: string | undefined, time: string | undefined): string {
  if (!date) return '';
  const [h = '0', m = '0'] = (time ?? '').split(':');
  const end = new Date(`${date}T00:00:00`);
  end.setHours(Number(h) + 5, Number(m));
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}` +
    `T${pad(end.getHours())}${pad(end.getMinutes())}00`
  );
}
