import { withConfig } from '@/lib/route';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/guard';
import { getSettings, saveSettings } from '@/lib/store';
import {
  DEFAULT_LIFECYCLE,
  nextId,
  parseMenu,
  toLines,
  type Menu,
  type Settings,
  type Venue,
} from '@/lib/settings';

export const dynamic = 'force-dynamic';

/**
 * Genel ayarlar — salonlar, menüler, işletme bilgisi, davetiye ömrü.
 *
 * Okuma her oturumlu hesaba açık: çift kendi sihirbazında salon ve menü
 * listesini görmek zorunda. Yazma yalnızca yöneticide — çift, seçebildiği
 * salonun adresini değiştiremesin.
 */
async function handleGet() {
  const result = requireSession();
  if ('error' in result) return result.error;
  return NextResponse.json(await getSettings());
}

function temizleVenue(input: Record<string, unknown>, mevcut: Venue[]): Venue | { error: string } {
  const id = String(input.id ?? '').trim();
  const venueName = String(input.venueName ?? '').trim();
  if (!venueName) return { error: 'Salon adı zorunlu.' };

  const features = Array.isArray(input.features)
    ? input.features.map((f) => String(f).trim()).filter(Boolean).slice(0, 60)
    : toLines(String(input.features ?? ''));

  return {
    id: id || nextId('salon', mevcut.map((v) => v.id)),
    venueName,
    address: String(input.address ?? '').trim(),
    district: String(input.district ?? '').trim(),
    city: String(input.city ?? '').trim(),
    mapUrl: String(input.mapUrl ?? '').trim(),
    features,
  };
}

function temizleMenu(input: Record<string, unknown>, mevcut: Menu[]): Menu | { error: string } {
  const id = String(input.id ?? '').trim();
  const name = String(input.name ?? '').trim();
  if (!name) return { error: 'Menü adı zorunlu.' };

  const groups = Array.isArray(input.groups)
    ? (input.groups as Menu['groups'])
    : parseMenu(String(input.groups ?? ''));

  return { id: id || nextId('menu', mevcut.map((m) => m.id)), name, groups };
}

/** Listede varsa günceller, yoksa ekler. */
function upsert<T extends { id: string }>(liste: T[], oge: T): T[] {
  const i = liste.findIndex((x) => x.id === oge.id);
  if (i === -1) return [...liste, oge];
  const out = [...liste];
  out[i] = oge;
  return out;
}

async function handlePut(request: Request) {
  const result = requireSession();
  if ('error' in result) return result.error;

  if (result.session.role !== 'admin') {
    return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  }

  const mevcut = await getSettings();
  const yama: Partial<Settings> = {};
  const g = body as Record<string, unknown>;

  if (g.venue) {
    const v = temizleVenue(g.venue as Record<string, unknown>, mevcut.venues);
    if ('error' in v) return NextResponse.json(v, { status: 400 });
    yama.venues = upsert(mevcut.venues, v);
  }

  if (typeof g.deleteVenue === 'string') {
    yama.venues = mevcut.venues.filter((v) => v.id !== g.deleteVenue);
  }

  if (g.menu) {
    const m = temizleMenu(g.menu as Record<string, unknown>, mevcut.menus);
    if ('error' in m) return NextResponse.json(m, { status: 400 });
    yama.menus = upsert(mevcut.menus, m);
  }

  if (typeof g.deleteMenu === 'string') {
    yama.menus = mevcut.menus.filter((m) => m.id !== g.deleteMenu);
  }

  if (g.brand && typeof g.brand === 'object') {
    const b = g.brand as Record<string, unknown>;
    yama.brand = {
      instagram: String(b.instagram ?? '').trim(),
      instagramLabel: String(b.instagramLabel ?? '').trim(),
    };
  }

  if (g.lifecycle && typeof g.lifecycle === 'object') {
    const l = g.lifecycle as Record<string, unknown>;
    const sayi = (v: unknown, alt: number, min: number, max: number) => {
      const n = Number(v);
      return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : alt;
    };
    yama.lifecycle = {
      unpublishDays: sayi(l.unpublishDays, DEFAULT_LIFECYCLE.unpublishDays, 0, 365),
      deleteDays: sayi(l.deleteDays, DEFAULT_LIFECYCLE.deleteDays, 1, 3650),
      deleteEnabled: Boolean(l.deleteEnabled),
    };
  }

  return NextResponse.json(await saveSettings(yama));
}

export const GET = withConfig(handleGet);
export const PUT = withConfig(handlePut);
