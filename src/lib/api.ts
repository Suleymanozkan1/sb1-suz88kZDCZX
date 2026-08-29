import type { GuestPhoto, Invitation, InvitationInput, Rsvp, SafeUser, Session } from './types';

async function json<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `İstek başarısız (${response.status})`);
  }
  return response.json();
}

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
