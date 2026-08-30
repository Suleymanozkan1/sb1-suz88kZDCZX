/**
 * Depo seçimi.
 *
 * Bir Postgres bağlantı adresi bulunursa üretim (SQL) sürücüsü, bulunmazsa
 * yerel dosya sürücüsü kullanılır. Adresin hangi değişkende durduğu
 * sağlayıcıya göre değişir; `lib/database-url.ts` hepsine bakar. İki modül de aynı işlev kümesini dışa verir; API
 * rotaları ve arayüz hangi sürücünün çalıştığını bilmez.
 */
import { databaseUrl } from '../database-url';
import { applyVenue, stripVenue } from '../venue';
import type { Invitation, InvitationInput } from '../types';
import * as file from './file';
import * as sql from './sql';

export const usingDatabase = Boolean(databaseUrl());

const driver = usingDatabase ? sql : file;

export const getVenue = driver.getVenue;
export const saveVenue = driver.saveVenue;

/*
   Mekân her davetiyeye BURADA ekleniyor.

   Böylece Hero'dan paylaşım kartına, harita bölümünden sayfa başlığına kadar
   her yer `invitation.city` / `invitation.venueName` okumaya devam ediyor ve
   tek bir yerin bile kodu değişmiyor. Alternatifi, ortak ayarı on beş ayrı
   bileşene elden geçirmekti; biri unutulduğunda davetiyenin bir köşesinde
   eski adres kalırdı.

   Yazarken de ters yönde: çiftin gövdesinden gelen mekân alanları düşürülür,
   yani hazırlanmış bir istekle bile değiştirilemez.
*/
async function venueli<T extends Invitation | null>(gelen: Promise<T>): Promise<T> {
  const [invitation, venue] = await Promise.all([gelen, driver.getVenue()]);
  return (invitation ? applyVenue(invitation, venue) : invitation) as T;
}

export async function listInvitations(): Promise<Invitation[]> {
  const [rows, venue] = await Promise.all([driver.listInvitations(), driver.getVenue()]);
  return rows.map((row) => applyVenue(row, venue));
}

export const getInvitation = (id: string) => venueli(driver.getInvitation(id));
export const getInvitationBySlug = (slug: string) => venueli(driver.getInvitationBySlug(slug));

export const createInvitation = (input: InvitationInput, ownerId: string) =>
  venueli(driver.createInvitation(stripVenue(input), ownerId));

export const updateInvitation = (id: string, input: InvitationInput) =>
  venueli(driver.updateInvitation(id, stripVenue(input)));

export const deleteInvitation = driver.deleteInvitation;

export const listRsvps = driver.listRsvps;
export const createRsvp = driver.createRsvp;
export const deleteRsvp = driver.deleteRsvp;

export const ensureAdmin = driver.ensureAdmin;
export const listUsers = driver.listUsers;
export const getUser = driver.getUser;
export const getUserByUsername = driver.getUserByUsername;
export const createUser = driver.createUser;
export const updateUser = driver.updateUser;
export const deleteUser = driver.deleteUser;
export const toSafeUser = driver.toSafeUser;

export const listPhotos = driver.listPhotos;
export const listPhotosForOwner = driver.listPhotosForOwner;
export const getPhoto = driver.getPhoto;
export const createPhoto = driver.createPhoto;
export const deletePhoto = driver.deletePhoto;

export const ownsInvitation = driver.ownsInvitation;
export const listApprovedWishes = driver.listApprovedWishes;
export const listWishes = driver.listWishes;
export const listWishesForOwner = driver.listWishesForOwner;
export const getWish = driver.getWish;
export const createWish = driver.createWish;
export const setWishApproved = driver.setWishApproved;
export const deleteWish = driver.deleteWish;
