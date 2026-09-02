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

/** Düğün oturumu — saatler buradan türer. */
export type SessionId = 'gunduz' | 'aksam';

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

/**
 * Menü grubu — "ORDÖVR TABAĞI" başlığı ve altındaki öğeler.
 *
 * Menünün ADI burada yok: davetiyede görünmüyor, çünkü misafir için
 * "Menü-3" bir anlam taşımıyor — o, işletmeyle çift arasındaki bir numara.
 */
export interface MenuGroup {
  title: string;
  items: string[];
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
  /**
   * Oturum — saatleri BU belirler.
   *
   * Salon iki oturum çalışıyor; serbest saat alanı çifte gerçekte var
   * olmayan bir seçenek sunuyordu (11:00 yazan bir davetiye, salonda
   * karşılığı olmayan bir söz).
   */
  session: SessionId;
  weddingTime: string;
  weddingEndTime: string;
  /** Seçilen salonun kimliği; adres alanları ondan gelir. */
  venueId: string;
  venueName: string;
  address: string;
  city: string;
  district: string;
  mapUrl: string;
  /** Salonun misafire yönelik bilgileri — otopark, ulaşım, çocuk alanı. */
  venueFeatures: string[];

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

  /* Bölüm başlıkları — boş bırakılırsa varsayılan metin kullanılır. */
  detailsSectionTitle: string;
  detailsSectionSubtitle: string;
  programSectionTitle: string;
  programSectionSubtitle: string;
  locationSectionTitle: string;
  locationSectionSubtitle: string;
  rsvpSectionTitle: string;
  rsvpSectionSubtitle: string;
  contactSectionTitle: string;

  /* İçerik blokları */
  storySectionTitle: string;
  storySectionSubtitle: string;
  storyItems: StoryItem[];
  programItems: ProgramItem[];
  socialLinks: SocialLink[];
  socialSectionTitle: string;
  hashtag: string;

  /* Menü */
  menuId: string;
  menuGroups: MenuGroup[];
  menuSectionTitle: string;
  menuSectionSubtitle: string;

  /* Ailelerimiz */
  familySectionTitle: string;
  familySectionSubtitle: string;
  brideFamilyLabel: string;
  brideFamilyText: string;
  groomFamilyLabel: string;
  groomFamilyText: string;

  /** İşaretsizse davetiyede "yalnızca yetişkinlere yöneliktir" yazar. */
  childrenWelcome: boolean;

  /* Katılım */
  rsvpDeadline: string;

  /*
   * Bölüm görünürlükleri.
   *
   * Bir bölümü gizlemenin tek yolu içeriğini boşaltmaktı — yani çift
   * sonra geri açmak isterse yazdıklarını kaybediyordu. giftEnabled ve
   * wishesEnabled aynı işi görüyor, adları eski kayıtlar yüzünden korundu.
   */
  showLetter: boolean;
  showStory: boolean;
  showDetails: boolean;
  showProgram: boolean;
  showGallery: boolean;
  showLocation: boolean;
  showMenu: boolean;
  showFamily: boolean;
  showChildren: boolean;
  showRsvp: boolean;
  showSocial: boolean;
  showContact: boolean;

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
