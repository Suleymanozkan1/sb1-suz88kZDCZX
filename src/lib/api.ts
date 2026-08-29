import type { Invitation, InvitationInput, Rsvp } from './types';

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

export function login(password: string): Promise<{ ok: true }> {
  return fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  }).then(json<{ ok: true }>);
}

export async function logout(): Promise<void> {
  await fetch('/api/auth', { method: 'DELETE' });
}
