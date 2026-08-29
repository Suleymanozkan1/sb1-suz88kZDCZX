import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { emptyInvitation } from './defaults';
import { slugify } from './slug';
import type { Invitation, InvitationInput, Rsvp } from './types';

/**
 * Dosya tabanlı basit kalıcı depo.
 *
 * Yerelde ve kendi sunucunuzda `data/*.json` dosyalarına yazar. Salt-okunur
 * dosya sistemine sahip ortamlarda (ör. Vercel serverless) yazma sessizce
 * başarısız olur ve süreç ömrü boyunca bellekteki kopya kullanılır — kalıcı
 * kayıt için bu modülü bir veritabanı sürücüsüyle değiştirmek yeterlidir.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const INVITATIONS_FILE = path.join(DATA_DIR, 'invitations.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');

type Cache = { invitations: Invitation[] | null; rsvps: Rsvp[] | null };

const globalCache = globalThis as unknown as { __davetiyeCache?: Cache };
const cache: Cache = (globalCache.__davetiyeCache ??= { invitations: null, rsvps: null });

async function readFile<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFile<T>(file: string, rows: T[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify(rows, null, 2), 'utf8');
  } catch {
    // Salt-okunur dosya sistemi: bellekteki kopyayla devam edilir.
  }
}

async function loadInvitations(): Promise<Invitation[]> {
  cache.invitations ??= await readFile<Invitation>(INVITATIONS_FILE);
  return cache.invitations;
}

async function saveInvitations(rows: Invitation[]): Promise<void> {
  cache.invitations = rows;
  await writeFile(INVITATIONS_FILE, rows);
}

async function loadRsvps(): Promise<Rsvp[]> {
  cache.rsvps ??= await readFile<Rsvp>(RSVPS_FILE);
  return cache.rsvps;
}

async function saveRsvps(rows: Rsvp[]): Promise<void> {
  cache.rsvps = rows;
  await writeFile(RSVPS_FILE, rows);
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const rows = await loadInvitations();
  const taken = new Set(rows.filter((r) => r.id !== ignoreId).map((r) => r.slug));
  let slug = base || 'davetiye';
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

export async function listInvitations(): Promise<Invitation[]> {
  const rows = await loadInvitations();
  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getInvitation(id: string): Promise<Invitation | null> {
  const rows = await loadInvitations();
  return rows.find((r) => r.id === id) ?? null;
}

export async function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  const rows = await loadInvitations();
  return rows.find((r) => r.slug === slug) ?? null;
}

export async function createInvitation(input: InvitationInput): Promise<Invitation> {
  const rows = await loadInvitations();
  const base = emptyInvitation();
  const now = new Date().toISOString();

  const slugSource =
    input.slug?.trim() ||
    `${input.groomName ?? ''}-${input.brideName ?? ''}`.trim() ||
    'davetiye';

  const invitation: Invitation = {
    ...base,
    ...input,
    id: randomUUID(),
    slug: await uniqueSlug(slugify(slugSource)),
    createdAt: now,
    updatedAt: now,
  };

  await saveInvitations([...rows, invitation]);
  return invitation;
}

export async function updateInvitation(
  id: string,
  input: InvitationInput,
): Promise<Invitation | null> {
  const rows = await loadInvitations();
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = rows[index];
  const nextSlug = input.slug?.trim()
    ? await uniqueSlug(slugify(input.slug), id)
    : current.slug;

  const updated: Invitation = {
    ...current,
    ...input,
    id: current.id,
    slug: nextSlug,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  };

  const next = [...rows];
  next[index] = updated;
  await saveInvitations(next);
  return updated;
}

export async function deleteInvitation(id: string): Promise<boolean> {
  const rows = await loadInvitations();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await saveInvitations(next);
  return true;
}

export async function listRsvps(slug?: string): Promise<Rsvp[]> {
  const rows = await loadRsvps();
  const filtered = slug ? rows.filter((r) => r.invitationSlug === slug) : rows;
  return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createRsvp(input: Omit<Rsvp, 'id' | 'createdAt'>): Promise<Rsvp> {
  const rows = await loadRsvps();
  const rsvp: Rsvp = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  await saveRsvps([...rows, rsvp]);
  return rsvp;
}

export async function deleteRsvp(id: string): Promise<boolean> {
  const rows = await loadRsvps();
  const next = rows.filter((r) => r.id !== id);
  if (next.length === rows.length) return false;
  await saveRsvps(next);
  return true;
}
