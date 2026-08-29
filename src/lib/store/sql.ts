import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { emptyInvitation } from '../defaults';
import { hashPassword, seedFingerprint } from '../password';
import { slugify } from '../slug';
import type {
  GuestPhoto,
  Invitation,
  InvitationInput,
  Role,
  Rsvp,
  SafeUser,
  User,
} from '../types';

/**
 * Postgres depo — üretim sürücüsü.
 *
 * `POSTGRES_URL` tanımlıysa `index.ts` bu modülü seçer. Şema ilk sorguda
 * kendiliğinden oluşturulur; ayrı bir migration adımı yoktur.
 *
 * Davetiyenin sık değişen alan kümesi tek bir `jsonb` sütununda durur;
 * yalnızca sorgulanan alanlar (slug, owner_id, is_active) ayrı sütundadır.
 * Böylece yeni bir davetiye alanı eklemek şema değişikliği gerektirmez.
 */

const globalPool = globalThis as unknown as { __davetiyePool?: Pool; __davetiyeSchema?: Promise<void> };

function pool(): Pool {
  if (!globalPool.__davetiyePool) {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) throw new Error('POSTGRES_URL tanımlı değil');

    const local = /@(localhost|127\.0\.0\.1)/.test(connectionString);
    globalPool.__davetiyePool = new Pool({
      connectionString,
      // Uzak veritabanları TLS ister; bağlantı dizesinde sslmode varsa pg onu kullanır.
      ssl: local || connectionString.includes('sslmode=') ? undefined : { rejectUnauthorized: true },
      max: 5,
    });
  }
  return globalPool.__davetiyePool;
}

const SCHEMA = `
  create table if not exists users (
    id text primary key,
    username text not null unique,
    display_name text not null,
    role text not null,
    password_hash text not null,
    password_seed text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  -- Mevcut kurulumlar için: sütun sonradan eklendi.
  alter table users add column if not exists password_seed text;

  create table if not exists invitations (
    id text primary key,
    owner_id text not null,
    slug text not null unique,
    is_active boolean not null default true,
    data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
  create index if not exists invitations_owner_idx on invitations (owner_id);

  create table if not exists rsvps (
    id text primary key,
    invitation_slug text not null,
    name text not null,
    phone text not null,
    count text not null default '1',
    note text not null default '',
    attending boolean not null default true,
    created_at timestamptz not null default now()
  );
  create index if not exists rsvps_slug_idx on rsvps (invitation_slug);

  create table if not exists photos (
    id text primary key,
    invitation_id text not null,
    invitation_slug text not null,
    uploader_name text not null default '',
    note text not null default '',
    file_name text not null,
    thumb_name text not null,
    mime_type text not null default '',
    size bigint not null default 0,
    width integer not null default 0,
    height integer not null default 0,
    created_at timestamptz not null default now()
  );
  create index if not exists photos_invitation_idx on photos (invitation_id);
`;

/** Şemayı süreç başına bir kez kurar; eşzamanlı çağrılar aynı sözü bekler. */
function ready(): Promise<void> {
  globalPool.__davetiyeSchema ??= pool()
    .query(SCHEMA)
    .then(() => undefined);
  return globalPool.__davetiyeSchema;
}

async function query<T extends Record<string, unknown>>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  await ready();
  const result = await pool().query(text, values);
  return result.rows as T[];
}

const iso = (value: Date | string): string =>
  value instanceof Date ? value.toISOString() : new Date(value).toISOString();

/* ================================================================ davetiyeler */

type InvitationRow = {
  id: string;
  owner_id: string;
  slug: string;
  is_active: boolean;
  data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
};

function toInvitation(row: InvitationRow): Invitation {
  return {
    ...(row.data as unknown as Invitation),
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    isActive: row.is_active,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

/** Sütuna taşınan alanlar jsonb gövdesinde tekrarlanmaz. */
function toData(invitation: Partial<Invitation>): Record<string, unknown> {
  const { id, ownerId, slug, isActive, createdAt, updatedAt, ...rest } = invitation;
  return rest as Record<string, unknown>;
}

export async function listInvitations(): Promise<Invitation[]> {
  const rows = await query<InvitationRow>(
    'select * from invitations order by created_at desc',
  );
  return rows.map(toInvitation);
}

export async function getInvitation(id: string): Promise<Invitation | null> {
  const rows = await query<InvitationRow>('select * from invitations where id = $1', [id]);
  return rows[0] ? toInvitation(rows[0]) : null;
}

export async function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  const rows = await query<InvitationRow>('select * from invitations where slug = $1', [slug]);
  return rows[0] ? toInvitation(rows[0]) : null;
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const rows = await query<{ slug: string }>(
    'select slug from invitations where ($1::text is null or id <> $1)',
    [ignoreId ?? null],
  );
  const taken = new Set(rows.map((r) => r.slug));
  let slug = base || 'davetiye';
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

export async function createInvitation(
  input: InvitationInput,
  ownerId: string,
): Promise<Invitation> {
  const base = emptyInvitation();
  const merged = { ...base, ...input } as Invitation;

  const slugSource =
    input.slug?.trim() || `${input.groomName ?? ''}-${input.brideName ?? ''}`.trim() || 'davetiye';
  const slug = await uniqueSlug(slugify(slugSource));

  const rows = await query<InvitationRow>(
    `insert into invitations (id, owner_id, slug, is_active, data)
     values ($1, $2, $3, $4, $5) returning *`,
    [randomUUID(), ownerId, slug, merged.isActive ?? true, JSON.stringify(toData(merged))],
  );
  return toInvitation(rows[0]);
}

export async function updateInvitation(
  id: string,
  input: InvitationInput,
): Promise<Invitation | null> {
  const current = await getInvitation(id);
  if (!current) return null;

  const nextSlug = input.slug?.trim() ? await uniqueSlug(slugify(input.slug), id) : current.slug;
  // Sahiplik yalnızca yönetimsel bir işlemle değişir; gövdeden gelen ownerId yok sayılır.
  const merged = { ...current, ...input, ownerId: current.ownerId } as Invitation;

  const rows = await query<InvitationRow>(
    `update invitations
        set slug = $2, is_active = $3, data = $4, updated_at = now()
      where id = $1
      returning *`,
    [id, nextSlug, merged.isActive ?? true, JSON.stringify(toData(merged))],
  );
  return rows[0] ? toInvitation(rows[0]) : null;
}

export async function deleteInvitation(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    'delete from invitations where id = $1 returning id',
    [id],
  );
  return rows.length > 0;
}

/* ============================================================ katılım bildirimi */

type RsvpRow = {
  id: string;
  invitation_slug: string;
  name: string;
  phone: string;
  count: string;
  note: string;
  attending: boolean;
  created_at: Date;
};

const toRsvp = (row: RsvpRow): Rsvp => ({
  id: row.id,
  invitationSlug: row.invitation_slug,
  name: row.name,
  phone: row.phone,
  count: row.count,
  note: row.note,
  attending: row.attending,
  createdAt: iso(row.created_at),
});

export async function listRsvps(slug?: string): Promise<Rsvp[]> {
  const rows = await query<RsvpRow>(
    `select * from rsvps
      where ($1::text is null or invitation_slug = $1)
      order by created_at desc`,
    [slug ?? null],
  );
  return rows.map(toRsvp);
}

export async function createRsvp(input: Omit<Rsvp, 'id' | 'createdAt'>): Promise<Rsvp> {
  const rows = await query<RsvpRow>(
    `insert into rsvps (id, invitation_slug, name, phone, count, note, attending)
     values ($1, $2, $3, $4, $5, $6, $7) returning *`,
    [
      randomUUID(),
      input.invitationSlug,
      input.name,
      input.phone,
      input.count,
      input.note,
      input.attending,
    ],
  );
  return toRsvp(rows[0]);
}

export async function deleteRsvp(id: string): Promise<boolean> {
  const rows = await query<{ id: string }>('delete from rsvps where id = $1 returning id', [id]);
  return rows.length > 0;
}

/* ================================================================== kullanıcılar */

type UserRow = {
  id: string;
  username: string;
  display_name: string;
  role: Role;
  password_hash: string;
  password_seed: string | null;
  created_at: Date;
  updated_at: Date;
};

const toUser = (row: UserRow): User => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  role: row.role,
  passwordHash: row.password_hash,
  passwordSeed: row.password_seed ?? undefined,
  createdAt: iso(row.created_at),
  updatedAt: iso(row.updated_at),
});

export function toSafeUser(user: User): SafeUser {
  const { passwordHash, ...safe } = user;
  return safe;
}

const normalizeUsername = (input: string): string => slugify(input).replace(/-/g, '');

/**
 * Admin hesabını hazırlar.
 *
 * ADMIN_PASSWORD bir SIFIRLAMA KOLUDUR, sabit bir parola değil:
 *   • Hesap yoksa onunla oluşturulur.
 *   • Ortam değeri DEĞİŞTİYSE parola bir kez ona sıfırlanır (parolayı
 *     unutursanız kurtarma yolu budur — veritabanına dokunmak gerekmez).
 *   • Değer aynıysa dokunulmaz — panelden değiştirdiğiniz parola ezilmez.
 */
export async function ensureAdmin(): Promise<User> {
  const desired = process.env.ADMIN_PASSWORD;
  const seed = desired ? seedFingerprint(desired) : undefined;
  const existing = await query<UserRow>("select * from users where role = 'admin' limit 1");

  if (existing[0]) {
    const admin = toUser(existing[0]);
    if (!seed || admin.passwordSeed === seed) return admin;

    const synced = await query<UserRow>(
      `update users set password_hash = $2, password_seed = $3, updated_at = now()
        where id = $1 returning *`,
      [admin.id, await hashPassword(desired as string), seed],
    );
    return toUser(synced[0]);
  }

  // Eşzamanlı iki istek aynı anda admin oluşturmaya çalışırsa ikincisi çakışır
  // ve mevcut kaydı okur; bu yüzden ekleme çakışmayı yok sayar.
  const rows = await query<UserRow>(
    `insert into users (id, username, display_name, role, password_hash, password_seed)
     values ($1, 'admin', 'Yönetici', 'admin', $2, $3)
     on conflict (username) do nothing
     returning *`,
    [randomUUID(), await hashPassword(desired ?? 'admin'), seed ?? null],
  );
  if (rows[0]) return toUser(rows[0]);

  const again = await query<UserRow>("select * from users where role = 'admin' limit 1");
  if (!again[0]) {
    // 'admin' kullanıcı adı bir çift hesabına verilmişse buraya düşülür.
    throw new Error("'admin' kullanıcı adı başka bir hesap tarafından kullanılıyor.");
  }
  return toUser(again[0]);
}

export async function listUsers(): Promise<SafeUser[]> {
  await ensureAdmin();
  const rows = await query<UserRow>('select * from users order by created_at desc');
  return rows.map((r) => toSafeUser(toUser(r)));
}

export async function getUser(id: string): Promise<User | null> {
  const rows = await query<UserRow>('select * from users where id = $1', [id]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  await ensureAdmin();
  const rows = await query<UserRow>('select * from users where lower(username) = lower($1)', [
    username.trim(),
  ]);
  return rows[0] ? toUser(rows[0]) : null;
}

export async function createUser(input: {
  username: string;
  displayName: string;
  password: string;
  role?: Role;
}): Promise<SafeUser> {
  await ensureAdmin();

  const username = normalizeUsername(input.username);
  if (!username) throw new Error('Geçersiz kullanıcı adı.');

  const rows = await query<UserRow>(
    `insert into users (id, username, display_name, role, password_hash)
     values ($1, $2, $3, $4, $5)
     on conflict (username) do nothing
     returning *`,
    [
      randomUUID(),
      username,
      input.displayName.trim() || username,
      input.role ?? 'user',
      await hashPassword(input.password),
    ],
  );
  if (!rows[0]) throw new Error('Bu kullanıcı adı zaten kullanılıyor.');
  return toSafeUser(toUser(rows[0]));
}

export async function updateUser(
  id: string,
  input: { displayName?: string; password?: string },
): Promise<SafeUser | null> {
  const passwordHash = input.password ? await hashPassword(input.password) : null;
  const rows = await query<UserRow>(
    `update users
        set display_name = coalesce(nullif($2, ''), display_name),
            password_hash = coalesce($3, password_hash),
            updated_at = now()
      where id = $1
      returning *`,
    [id, input.displayName?.trim() ?? '', passwordHash],
  );
  return rows[0] ? toSafeUser(toUser(rows[0])) : null;
}

/**
 * Hesabı ve ona bağlı her şeyi siler. Silinen fotoğrafların dosya adları
 * çağırana döner ki depodaki karşılıkları da temizlenebilsin.
 */
export async function deleteUser(id: string): Promise<{ removed: boolean; files: string[] }> {
  const target = await getUser(id);
  if (!target) return { removed: false, files: [] };
  if (target.role === 'admin') throw new Error('Admin hesabı silinemez.');

  const doomed = await query<{ file_name: string; thumb_name: string }>(
    `select p.file_name, p.thumb_name
       from photos p
       join invitations i on i.id = p.invitation_id
      where i.owner_id = $1`,
    [id],
  );
  const files = doomed.flatMap((p) => [p.file_name, p.thumb_name]);

  await query(
    'delete from photos where invitation_id in (select id from invitations where owner_id = $1)',
    [id],
  );
  await query(
    'delete from rsvps where invitation_slug in (select slug from invitations where owner_id = $1)',
    [id],
  );
  await query('delete from invitations where owner_id = $1', [id]);
  await query('delete from users where id = $1', [id]);

  return { removed: true, files };
}

/* ========================================================= misafir fotoğrafları */

type PhotoRow = {
  id: string;
  invitation_id: string;
  invitation_slug: string;
  uploader_name: string;
  note: string;
  file_name: string;
  thumb_name: string;
  mime_type: string;
  size: string | number;
  width: number;
  height: number;
  created_at: Date;
};

const toPhoto = (row: PhotoRow): GuestPhoto => ({
  id: row.id,
  invitationId: row.invitation_id,
  invitationSlug: row.invitation_slug,
  uploaderName: row.uploader_name,
  note: row.note,
  fileName: row.file_name,
  thumbName: row.thumb_name,
  mimeType: row.mime_type,
  // bigint sürücüden dize olarak gelir
  size: Number(row.size),
  width: row.width,
  height: row.height,
  createdAt: iso(row.created_at),
});

export async function listPhotos(invitationId?: string): Promise<GuestPhoto[]> {
  const rows = await query<PhotoRow>(
    `select * from photos
      where ($1::text is null or invitation_id = $1)
      order by created_at desc`,
    [invitationId ?? null],
  );
  return rows.map(toPhoto);
}

export async function listPhotosForOwner(ownerId: string): Promise<GuestPhoto[]> {
  const rows = await query<PhotoRow>(
    `select p.* from photos p
       join invitations i on i.id = p.invitation_id
      where i.owner_id = $1
      order by p.created_at desc`,
    [ownerId],
  );
  return rows.map(toPhoto);
}

export async function getPhoto(id: string): Promise<GuestPhoto | null> {
  const rows = await query<PhotoRow>('select * from photos where id = $1', [id]);
  return rows[0] ? toPhoto(rows[0]) : null;
}

export async function createPhoto(
  input: Omit<GuestPhoto, 'id' | 'createdAt'>,
): Promise<GuestPhoto> {
  const rows = await query<PhotoRow>(
    `insert into photos
       (id, invitation_id, invitation_slug, uploader_name, note,
        file_name, thumb_name, mime_type, size, width, height)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning *`,
    [
      randomUUID(),
      input.invitationId,
      input.invitationSlug,
      input.uploaderName,
      input.note,
      input.fileName,
      input.thumbName,
      input.mimeType,
      input.size,
      input.width,
      input.height,
    ],
  );
  return toPhoto(rows[0]);
}

export async function deletePhoto(id: string): Promise<GuestPhoto | null> {
  const rows = await query<PhotoRow>('delete from photos where id = $1 returning *', [id]);
  return rows[0] ? toPhoto(rows[0]) : null;
}

export async function ownsInvitation(invitationId: string, userId: string): Promise<boolean> {
  const rows = await query<{ owner_id: string }>(
    'select owner_id from invitations where id = $1',
    [invitationId],
  );
  return rows[0]?.owner_id === userId;
}
