export type SealType =
  | 'gold-wax'
  | 'burgundy-wax'
  | 'emerald-wax'
  | 'bronze-wax'
  | 'silver-wax'
  | 'navy-wax'
  | 'rose-wax'
  | 'ivory-wax'
  | 'ottoman';

export type InvitationDesign = 'ottoman' | 'classic' | 'minimal' | 'arch' | 'vellum';

export type ThemeId =
  | 'cream-gold'
  | 'ottoman-premium'
  | 'minimal-white'
  | 'beige-gold'
  | 'dark-premium';

export interface StoryItem {
  year: string;
  title: string;
  desc: string;
  icon: string;
  side: 'left' | 'right';
  highlight?: boolean;
}

export interface ProgramItem {
  time: string;
  title: string;
  desc: string;
  icon: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface SocialLink {
  name: string;
  handle: string;
  href: string;
}

export interface Invitation {
  id: string;
  slug: string;

  /** Davetiyeyi yöneten kullanıcı hesabı. */
  ownerId: string;

  /* Çift bilgileri */
  brideName: string;
  groomName: string;
  brideSurname: string;
  groomSurname: string;
  conjunction: string;

  /* Düğün bilgileri */
  weddingDate: string;
  weddingTime: string;
  /** Bitiş saati — boşsa davetiyede yalnızca başlangıç yazar. */
  weddingEndTime: string;
  venueName: string;
  address: string;
  city: string;
  district: string;
  mapUrl: string;

  /* Davet metni */
  invitationText: string;

  /* Mühür & mektup */
  sealType: SealType;
  sealMonogram: string;
  sealImage: string;
  invitationDesign: InvitationDesign;
  letterImage: string;

  /* Görseller */
  coverImage: string;
  galleryImages: string[];
  gallerySectionTitle: string;
  gallerySectionSubtitle: string;

  /* Hediye — para hediyesi Türkiye'de yaygın; boş bırakılırsa bölüm görünmez. */
  giftEnabled: boolean;
  giftTitle: string;
  giftNote: string;
  giftAccountName: string;
  giftIban: string;
  giftBankName: string;
  /** Hediye listesi bağlantısı (varsa). */
  giftRegistryUrl: string;

  /* Dilek defteri */
  wishesEnabled: boolean;
  wishesTitle: string;
  wishesSubtitle: string;

  /* Ses */
  soundEnabled: boolean;
  soundVolume: number;
  backgroundMusicUrl: string;
  sealBreakSound: string;
  envelopeOpenSound: string;

  /* Bölüm başlıkları — boş bırakılırsa varsayılan metin kullanılır. */
  detailsSectionTitle: string;
  detailsSectionSubtitle: string;
  programSectionTitle: string;
  programSectionSubtitle: string;
  locationSectionTitle: string;
  locationSectionSubtitle: string;
  faqSectionTitle: string;
  faqSectionSubtitle: string;
  rsvpSectionTitle: string;
  rsvpSectionSubtitle: string;
  contactSectionTitle: string;

  /* İçerik blokları */
  storySectionTitle: string;
  storySectionSubtitle: string;
  storyItems: StoryItem[];
  programItems: ProgramItem[];
  faqItems: FaqItem[];
  socialLinks: SocialLink[];
  hashtag: string;

  /* Katılım */
  rsvpDeadline: string;

  /* Tema & durum */
  theme: ThemeId;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export type InvitationInput = Partial<Omit<Invitation, 'id' | 'createdAt' | 'updatedAt'>>;

export interface Rsvp {
  id: string;
  invitationSlug: string;
  name: string;
  phone: string;
  count: string;
  note: string;
  /** Misafirin DJ için istediği şarkı — düğün sitelerinde yaygın, isteğe bağlı. */
  songRequest: string;
  attending: boolean;
  createdAt: string;
}

/**
 * Dilek defteri kaydı.
 *
 * Misafirler davetiyeden mesaj bırakır; mesaj çift onaylayana kadar
 * yayımlanmaz. Onay şart: adres bilen herkes yazabildiği için, denetimsiz
 * bir duvar davetiyenin ortasında istenmeyen içerik demek olurdu.
 */
export interface Wish {
  id: string;
  invitationId: string;
  invitationSlug: string;
  name: string;
  message: string;
  approved: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ hesaplar */

export type Role = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  /** scrypt türevi: "tuz:hash" */
  passwordHash: string;
  /**
   * ADMIN_PASSWORD'ün parmak izi (yalnızca admin hesabında).
   * Ortam değişkeni DEĞİŞTİĞİNDE parolayı bir kez sıfırlamak için tutulur;
   * panelden yapılan değişiklikler bu izi bozmadığı için ezilmez.
   */
  passwordSeed?: string;
  createdAt: string;
  updatedAt: string;
}

/** Parola özeti taşımayan, arayüze gönderilebilen kullanıcı kaydı. */
export type SafeUser = Omit<User, 'passwordHash'>;

export interface Session {
  userId: string;
  username: string;
  displayName: string;
  role: Role;
}

/* ------------------------------------------------- misafirlerin yüklediği fotoğraflar */

export interface GuestPhoto {
  id: string;
  invitationId: string;
  invitationSlug: string;
  /** Fotoğrafı yükleyen misafirin adı (isteğe bağlı). */
  uploaderName: string;
  note: string;
  /** Orijinal dosyanın diskteki adı — yüksek çözünürlük burada saklanır. */
  fileName: string;
  /** Galeri ızgarası için küçük önizleme dosyası. */
  thumbName: string;
  mimeType: string;
  /** Orijinal dosyanın bayt cinsinden boyutu. */
  size: number;
  width: number;
  height: number;
  createdAt: string;
}
