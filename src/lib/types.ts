export type SealType =
  | 'gold-wax'
  | 'burgundy-wax'
  | 'emerald-wax'
  | 'bronze-wax'
  | 'silver-wax'
  | 'ottoman';

export type InvitationDesign = 'ottoman' | 'classic' | 'minimal';

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

  /* Çift bilgileri */
  brideName: string;
  groomName: string;
  brideSurname: string;
  groomSurname: string;
  conjunction: string;

  /* Düğün bilgileri */
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  address: string;
  city: string;
  district: string;
  mapUrl: string;

  /* Davet metni */
  invitationText: string;

  /* Manevi içerik */
  showBesmele: boolean;
  showAyet: boolean;
  showHadis: boolean;
  duaText: string;
  religiousSource: string;

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

  /* Ses */
  soundEnabled: boolean;
  soundVolume: number;
  backgroundMusicUrl: string;

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
  attending: boolean;
  createdAt: string;
}
