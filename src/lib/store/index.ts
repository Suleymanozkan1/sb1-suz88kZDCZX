/**
 * Depo seçimi.
 *
 * Bir Postgres bağlantı adresi bulunursa üretim (SQL) sürücüsü, bulunmazsa
 * yerel dosya sürücüsü kullanılır. Adresin hangi değişkende durduğu
 * sağlayıcıya göre değişir; `lib/database-url.ts` hepsine bakar. İki modül de aynı işlev kümesini dışa verir; API
 * rotaları ve arayüz hangi sürücünün çalıştığını bilmez.
 */
import { databaseUrl } from '../database-url';
import * as file from './file';
import * as sql from './sql';

export const usingDatabase = Boolean(databaseUrl());

const driver = usingDatabase ? sql : file;

export const listInvitations = driver.listInvitations;
export const getInvitation = driver.getInvitation;
export const getInvitationBySlug = driver.getInvitationBySlug;
export const createInvitation = driver.createInvitation;
export const updateInvitation = driver.updateInvitation;
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
