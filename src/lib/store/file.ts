import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { emptyInvitation } from '../defaults';
import { ConfigError } from '../errors';
import { hashPassword, seedFingerprint } from '../password';
import { slugify } from '../slug';
import type { GuestPhoto, Invitation, InvitationInput, Rsvp, Role, SafeUser, User } from '../types';

/**
 * Dosya tabanlı depo — yerel geliştirme sürücüsü.
 *
 * `data/*.json` dosyalarına yazar. Kurulum gerektirmediği için `npm run dev`
 * ile hiçbir servis açmadan çalışılabilir. POSTGRES_URL tanımlıysa devreye
 * `sql.ts` girer; seçim `index.ts` içinde yapılır.
 *
 * Bu sürücü Vercel'de çalışamaz: dosya sistemi salt-okunurdur ve her istek
 * ayrı bir örneğe düşebilir. Eskiden yazma hatası yutuluyor, kayıt yalnızca
 * o örneğin belleğinde kalıyordu; davetiye "oluşturuldu" görünüp bir sonraki
 * istekte "bulunamadı" oluyordu. Artık yazma denemesi açık bir yapılandırma
 * hatasıyla durur — üretimde SQL sürücüsü kullanılmalıdır.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const INVITATIONS_FILE = path.join(DATA_DIR, 'invitations.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

type Cache = {
  invitations: Invitation[] | null;
  rsvps: Rsvp[] | null;
  users: User[] | null;
  photos: GuestPhoto[] | null;
};

const globalCache = globalThis as unknown as { __davetiyeCache?: Cache };
const cache: Cache = (globalCache.__davetiyeCache ??= {
  invitations: null,
  rsvps: null,
  users: null,
  photos: null,
});

async function readFile<T>(file: string): Promise<T[]> {
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const NO_DATABASE =
  'Veritabanı bağlı değil, bu yüzden kayıt kalıcı olmuyor. Vercel projesinde ' +
  'Storage → Postgres oluşturup projeye bağlayın ve yeniden dağıtın (POSTGRES_URL).';

async function writeFile<T>(file: string, rows: T[]): Promise<void> {
  // Vercel'de bu sürücüyle yazmak anlamsızdır: kayıt yalnızca o örneğin
  // belleğinde kalır ve bir sonraki istek onu göremez. Sessizce başarılı
  // görünmek yerine sebebi söylenir.
  if (process.env.VERCEL) throw new ConfigError(NO_DATABASE);

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(file, JSON.stringify(rows, null, 2), 'utf8');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
      throw new ConfigError(NO_DATABASE);
    }
    throw err;
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

export async function createInvitation(
  input: InvitationInput,
  ownerId: string,
): Promise<Invitation> {
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
    ownerId,
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
    // Sahiplik yalnızca transferInvitation ile değişir; gövdeden gelen ownerId yok sayılır.
    ownerId: current.ownerId,
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

/* ================================================================== kullanıcılar */

async function loadUsers(): Promise<User[]> {
  cache.users ??= await readFile<User>(USERS_FILE);
  return cache.users;
}

async function saveUsers(rows: User[]): Promise<void> {
  cache.users = rows;
  await writeFile(USERS_FILE, rows);
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safe } = user;
  return safe;
}

function normalizeUsername(input: string): string {
  return slugify(input).replace(/-/g, '');
}

/**
 * Admin hesabını hazırlar.
 *
 * ADMIN_PASSWORD bir SIFIRLAMA KOLUDUR, sabit bir parola değil:
 *   • Hesap yoksa onunla oluşturulur.
 *   • Ortam değeri DEĞİŞTİYSE parola bir kez ona sıfırlanır (parolayı
 *     unutursanız kurtarma yolu budur).
 *   • Değer aynıysa dokunulmaz — böylece panelden değiştirdiğiniz parola
 *     her yeniden başlatmada ezilmez.
 */
export async function ensureAdmin(): Promise<User> {
  const rows = await loadUsers();
  const desired = process.env.ADMIN_PASSWORD;
  const seed = desired ? seedFingerprint(desired) : undefined;
  const existing = rows.find((r) => r.role === 'admin');

  if (existing) {
    if (!seed || existing.passwordSeed === seed) return existing;

    const synced: User = {
      ...existing,
      passwordHash: await hashPassword(desired as string),
      passwordSeed: seed,
      updatedAt: new Date().toISOString(),
    };
    await saveUsers(rows.map((r) => (r.id === existing.id ? synced : r)));
    return synced;
  }

  // Varsayılan parolaya düşmek yok: değişken yoksa hesap kurulmaz ve durum
  // açıkça bildirilir.
  if (!desired) throw new ConfigError('ADMIN_PASSWORD tanımlı değil. Sunucunun ortam değişkenlerine ekleyip yeniden dağıtın.');

  const now = new Date().toISOString();
  const admin: User = {
    id: randomUUID(),
    username: 'admin',
    displayName: 'Yönetici',
    role: 'admin',
    passwordHash: await hashPassword(desired),
    passwordSeed: seed,
    createdAt: now,
    updatedAt: now,
  };

  await saveUsers([...rows, admin]);
  return admin;
}

export async function listUsers(): Promise<SafeUser[]> {
  await ensureAdmin();
  const rows = await loadUsers();
  return [...rows]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toSafeUser);
}

export async function getUser(id: string): Promise<User | null> {
  const rows = await loadUsers();
  return rows.find((r) => r.id === id) ?? null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  await ensureAdmin();
  const rows = await loadUsers();
  const needle = username.trim().toLowerCase();
  return rows.find((r) => r.username.toLowerCase() === needle) ?? null;
}

export async function createUser(input: {
  username: string;
  displayName: string;
  password: string;
  role?: Role;
}): Promise<SafeUser> {
  await ensureAdmin();
  const rows = await loadUsers();

  const username = normalizeUsername(input.username);
  if (!username) throw new Error('Geçersiz kullanıcı adı.');
  if (rows.some((r) => r.username.toLowerCase() === username)) {
    throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
  }

  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    username,
    displayName: input.displayName.trim() || username,
    role: input.role ?? 'user',
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  };

  await saveUsers([...rows, user]);
  return toSafeUser(user);
}

export async function updateUser(
  id: string,
  input: { displayName?: string; password?: string },
): Promise<SafeUser | null> {
  const rows = await loadUsers();
  const index = rows.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = rows[index];
  const updated: User = {
    ...current,
    displayName: input.displayName?.trim() || current.displayName,
    passwordHash: input.password ? await hashPassword(input.password) : current.passwordHash,
    updatedAt: new Date().toISOString(),
  };

  const next = [...rows];
  next[index] = updated;
  await saveUsers(next);
  return toSafeUser(updated);
}

/**
 * Hesabı ve ona bağlı her şeyi siler: davetiyeler, katılım bildirimleri ve
 * misafir fotoğrafları. Silinen fotoğrafların dosya adları çağırana döner ki
 * diskteki karşılıkları da temizlenebilsin.
 */
export async function deleteUser(id: string): Promise<{ removed: boolean; files: string[] }> {
  const rows = await loadUsers();
  const target = rows.find((r) => r.id === id);
  if (!target) return { removed: false, files: [] };
  if (target.role === 'admin') throw new Error('Admin hesabı silinemez.');

  const invitations = await loadInvitations();
  const owned = invitations.filter((r) => r.ownerId === id);
  const ownedIds = new Set(owned.map((r) => r.id));
  const ownedSlugs = new Set(owned.map((r) => r.slug));

  const photos = await loadPhotos();
  const doomed = photos.filter((p) => ownedIds.has(p.invitationId));
  const files = doomed.flatMap((p) => [p.fileName, p.thumbName]);

  await savePhotos(photos.filter((p) => !ownedIds.has(p.invitationId)));

  const rsvps = await loadRsvps();
  await saveRsvps(rsvps.filter((r) => !ownedSlugs.has(r.invitationSlug)));

  await saveInvitations(invitations.filter((r) => r.ownerId !== id));
  await saveUsers(rows.filter((r) => r.id !== id));

  return { removed: true, files };
}

/* ========================================================= misafir fotoğrafları */

async function loadPhotos(): Promise<GuestPhoto[]> {
  cache.photos ??= await readFile<GuestPhoto>(PHOTOS_FILE);
  return cache.photos;
}

async function savePhotos(rows: GuestPhoto[]): Promise<void> {
  cache.photos = rows;
  await writeFile(PHOTOS_FILE, rows);
}

export async function listPhotos(invitationId?: string): Promise<GuestPhoto[]> {
  const rows = await loadPhotos();
  const filtered = invitationId ? rows.filter((p) => p.invitationId === invitationId) : rows;
  return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Bir kullanıcının tüm davetiyelerine yüklenen fotoğraflar. */
export async function listPhotosForOwner(ownerId: string): Promise<GuestPhoto[]> {
  const invitations = await loadInvitations();
  const ownedIds = new Set(invitations.filter((r) => r.ownerId === ownerId).map((r) => r.id));
  const rows = await loadPhotos();
  return rows
    .filter((p) => ownedIds.has(p.invitationId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPhoto(id: string): Promise<GuestPhoto | null> {
  const rows = await loadPhotos();
  return rows.find((p) => p.id === id) ?? null;
}

export async function createPhoto(
  input: Omit<GuestPhoto, 'id' | 'createdAt'>,
): Promise<GuestPhoto> {
  const rows = await loadPhotos();
  const photo: GuestPhoto = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
  await savePhotos([...rows, photo]);
  return photo;
}

export async function deletePhoto(id: string): Promise<GuestPhoto | null> {
  const rows = await loadPhotos();
  const target = rows.find((p) => p.id === id);
  if (!target) return null;
  await savePhotos(rows.filter((p) => p.id !== id));
  return target;
}

/** Bir davetiyenin sahibi mi? Admin her kayda erişebildiği için ayrıca kontrol edilir. */
export async function ownsInvitation(invitationId: string, userId: string): Promise<boolean> {
  const invitation = await getInvitation(invitationId);
  return invitation?.ownerId === userId;
}
