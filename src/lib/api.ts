import type { GuestPhoto, Invitation, InvitationInput, Rsvp, SafeUser, Session, Wish } from './types';
import type { Menu, Settings, Venue } from './settings';

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `İstek başarısız (${response.status})`);
  }
  return response.json();
}

/** Genel ayarlar — okuma oturumlu herkese, yazma yalnızca yöneticiye açık. */
export function getSettings(): Promise<Settings> {
  return fetch('/api/settings', { cache: 'no-store' }).then(json<Settings>);
}

function yamala(body: unknown): Promise<Settings> {
  return fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(json<Settings>);
}

/** features hem metin hem dizi kabul eder; sunucu ikisini de anlıyor. */
export const saveVenue = (venue: Partial<Omit<Venue, 'features'>> & { features?: string | string[] }) =>
  yamala({ venue });
export const deleteVenue = (id: string) => yamala({ deleteVenue: id });

export const saveMenu = (menu: Partial<Omit<Menu, 'groups'>> & { groups?: string | Menu['groups'] }) =>
  yamala({ menu });
export const deleteMenu = (id: string) => yamala({ deleteMenu: id });

export const saveBrand = (brand: Settings['brand']) => yamala({ brand });
export const saveLifecycle = (lifecycle: Settings['lifecycle']) => yamala({ lifecycle });

export function listInvitations(): Promise<Invitation[]> {
  return fetch('/api/invitations', { cache: 'no-store' }).then(json<Invitation[]>);
}

export function getInvitation(id: string): Promise<Invitation> {
  return fetch(`/api/invitations/${id}`, { cache: 'no-store' }).then(json<Invitation>);
}

export function getInvitationBySlug(slug: string): Promise<Invitation> {
  return fetch(`/api/invitations?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' }).then(
    json<Invitation>,
  );
}

export function createInvitation(input: InvitationInput): Promise<Invitation> {
  return fetch('/api/invitations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(json<Invitation>);
}

export function updateInvitation(id: string, input: InvitationInput): Promise<Invitation> {
  return fetch(`/api/invitations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(json<Invitation>);
}

export async function deleteInvitation(id: string): Promise<void> {
  await json(await fetch(`/api/invitations/${id}`, { method: 'DELETE' }));
}

export async function toggleInvitation(id: string): Promise<Invitation> {
  const current = await getInvitation(id);
  return updateInvitation(id, { isActive: !current.isActive });
}

export function listRsvps(slug?: string): Promise<Rsvp[]> {
  const query = slug ? `?slug=${encodeURIComponent(slug)}` : '';
  return fetch(`/api/rsvp${query}`, { cache: 'no-store' }).then(json<Rsvp[]>);
}

export async function deleteRsvp(id: string): Promise<void> {
  await json(await fetch(`/api/rsvp?id=${encodeURIComponent(id)}`, { method: 'DELETE' }));
}

export function login(username: string, password: string): Promise<{ ok: true; session: Session }> {
  return fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(json<{ ok: true; session: Session }>);
}

/** Oturum sahibinin kendi parolasını değiştirmesi. */
export function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ ok: true }> {
  return fetch('/api/auth/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then(json<{ ok: true }>);
}

/* ------------------------------------------------------------------ hesaplar */

export function listUsers(): Promise<SafeUser[]> {
  return fetch('/api/users', { cache: 'no-store' }).then(json<SafeUser[]>);
}

export function createUser(input: {
  username: string;
  displayName: string;
  password?: string;
}): Promise<{ user: SafeUser; password: string }> {
  return fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then(json<{ user: SafeUser; password: string }>);
}

export function resetUserPassword(
  id: string,
  password?: string,
): Promise<{ user: SafeUser; password: string }> {
  return fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetPassword: true, password }),
  }).then(json<{ user: SafeUser; password: string }>);
}

export function renameUser(id: string, displayName: string): Promise<{ user: SafeUser }> {
  return fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  }).then(json<{ user: SafeUser }>);
}

export async function deleteUser(id: string): Promise<void> {
  await json(await fetch(`/api/users/${id}`, { method: 'DELETE' }));
}

/* --------------------------------------------------------- misafir fotoğrafları */

export function listPhotos(invitationId?: string): Promise<GuestPhoto[]> {
  const query = invitationId ? `?invitationId=${encodeURIComponent(invitationId)}` : '';
  return fetch(`/api/photos${query}`, { cache: 'no-store' }).then(json<GuestPhoto[]>);
}

export async function deletePhoto(id: string): Promise<void> {
  await json(await fetch(`/api/photos/${id}`, { method: 'DELETE' }));
}

/** Galeri önizlemesi ve tam çözünürlüklü indirme adresleri. */
export function photoThumbUrl(id: string): string {
  return `/api/photos/${id}/file?size=thumb`;
}

export function photoFullUrl(id: string): string {
  return `/api/photos/${id}/file`;
}

export function photoDownloadUrl(id: string): string {
  return `/api/photos/${id}/file?download=1`;
}

export function photosZipUrl(invitationId?: string): string {
  return invitationId ? `/api/photos/zip?invitationId=${encodeURIComponent(invitationId)}` : '/api/photos/zip';
}

export async function logout(): Promise<void> {
  await fetch('/api/auth', { method: 'DELETE' });
}

/* ------------------------------------------------------------------ dilekler */

export function listWishes(invitationId?: string): Promise<Wish[]> {
  const query = invitationId ? `?invitationId=${encodeURIComponent(invitationId)}` : '';
  return fetch(`/api/wishes${query}`, { cache: 'no-store' }).then(json<Wish[]>);
}

export async function setWishApproved(id: string, approved: boolean): Promise<Wish> {
  return json<Wish>(
    await fetch(`/api/wishes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    }),
  );
}

export async function deleteWish(id: string): Promise<void> {
  await json(await fetch(`/api/wishes/${id}`, { method: 'DELETE' }));
}
