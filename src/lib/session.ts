import type { SessionId } from './types';

/**
 * Düğün oturumları.
 *
 * Salon yalnızca iki oturum çalışıyor. Serbest saat alanı çifte gerçekte
 * var olmayan bir seçenek sunuyordu: 11:00 yazan bir davetiye, salonda
 * karşılığı olmayan bir söz. Saat artık oturumdan türüyor ve iki sürümde
 * (Next / WordPress) aynı iki değer geçerli.
 */
export const SESSIONS: Record<SessionId, { label: string; start: string; end: string }> = {
  gunduz: { label: 'Gündüz Düğünü', start: '13:00', end: '17:00' },
  aksam: { label: 'Akşam Düğünü', start: '19:00', end: '23:00' },
};

export const SESSION_OPTIONS = Object.entries(SESSIONS).map(([id, s]) => ({
  id: id as SessionId,
  ...s,
}));

export function session(id: string | undefined): { label: string; start: string; end: string } {
  return SESSIONS[(id as SessionId) in SESSIONS ? (id as SessionId) : 'aksam'];
}

/** Oturuma göre saatleri davetiyenin üstüne yazar. */
export function applySession<T extends { session?: string; weddingTime?: string; weddingEndTime?: string }>(
  input: T,
): T {
  const s = session(input.session);
  return { ...input, weddingTime: s.start, weddingEndTime: s.end };
}
