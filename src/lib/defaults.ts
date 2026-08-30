import type {
  FaqItem,
  Invitation,
  InvitationDesign,
  ProgramItem,
  SealType,
  StoryItem,
  ThemeId,
} from './types';

export const SEAL_OPTIONS: { id: SealType; label: string }[] = [
  { id: 'gold-wax', label: 'Gold Balmumu' },
  { id: 'burgundy-wax', label: 'Bordo Balmumu' },
  { id: 'emerald-wax', label: 'Zümrüt Balmumu' },
  { id: 'bronze-wax', label: 'Bronz Balmumu' },
  { id: 'silver-wax', label: 'Gümüş Balmumu' },
  { id: 'navy-wax', label: 'Lacivert Balmumu' },
  { id: 'rose-wax', label: 'Gül Kurusu Balmumu' },
  { id: 'ivory-wax', label: 'Fildişi Balmumu' },
  { id: 'ottoman', label: 'Osmanlı Tuğrası' },
];

export const DESIGN_OPTIONS: { id: InvitationDesign; label: string }[] = [
  { id: 'ottoman', label: 'Osmanlı' },
  { id: 'classic', label: 'Klasik' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'arch', label: 'Kemerli' },
  { id: 'vellum', label: 'Vellum' },
];

export const THEME_OPTIONS: {
  id: ThemeId;
  label: string;
  bg: string;
  accent: string;
}[] = [
  { id: 'cream-gold', label: 'Krem & Gold', bg: '#FAF6F0', accent: '#C9A84C' },
  { id: 'ottoman-premium', label: 'Osmanlı Premium', bg: '#1a0f08', accent: '#C9A84C' },
  { id: 'minimal-white', label: 'Minimal Beyaz', bg: '#FFFFFF', accent: '#333333' },
  { id: 'beige-gold', label: 'Bej & Gold', bg: '#F5EDD8', accent: '#9A7B2F' },
  { id: 'dark-premium', label: 'Koyu Premium', bg: '#0d0805', accent: '#E8D5A3' },
];

export const CONJUNCTION_OPTIONS: { id: string; example: string }[] = [
  { id: '&', example: 'Ahmet & Ayşe' },
  { id: 've', example: 'Ahmet ve Ayşe' },
  { id: '♡', example: 'Ahmet ♡ Ayşe' },
  { id: '×', example: 'Ahmet × Ayşe' },
];

export const READY_TEXTS: { label: string; text: string }[] = [
  {
    label: 'Klasik',
    text: 'Bu mutlu günümüzde sizleri de aramızda görmekten büyük mutluluk duyarız.',
  },
  {
    label: 'Zarif',
    text: 'Hayatımızın en özel gününde, sevdiklerimizle birlikte olmak dileğiyle sizleri aramızda görmekten onur duyarız.',
  },
  {
    label: 'Samimi',
    text: 'Bir ömür boyu sürecek yolculuğumuzun ilk adımını atarken, siz değerli misafirlerimizi de yanımızda görmek isteriz.',
  },
  {
    label: 'Geleneksel',
    text: 'Evliliğimizin ilk gününde bizimle olmanız, mutluluğumuzu kat kat artıracaktır. Teşrifleriniz bizi onurlandıracaktır.',
  },
];

export const DEFAULT_STORY_ITEMS: StoryItem[] = [
  {
    year: '2022',
    title: 'İlk Tanışma',
    desc: 'Ortak bir arkadaşın davetinde gözlerimiz ilk kez buluştu.',
    icon: '✦',
    side: 'left',
  },
  {
    year: '2023',
    title: 'Söz',
    desc: 'Ailelerimizin huzurunda söz verdik.',
    icon: '❋',
    side: 'right',
  },
  {
    year: '2024',
    title: 'Nişan',
    desc: 'Nişan törenimizde halkalarımızı taktık.',
    icon: '◈',
    side: 'left',
  },
  {
    year: '2026',
    title: 'Düğün',
    desc: 'Ve şimdi, en güzel adımı birlikte atıyoruz.',
    icon: '♡',
    side: 'right',
    highlight: true,
  },
];

export const DEFAULT_PROGRAM_ITEMS: ProgramItem[] = [
  { time: '15:00', title: 'Kapı Açılışı', desc: 'Konukların karşılanması ve yerleşimi', icon: '◇' },
  { time: '16:00', title: 'Nikah Töreni', desc: 'Resmi nikah ve yüzük takma', icon: '♡' },
  { time: '16:30', title: 'Kokteyl & Fotoğraf', desc: 'Kadeh kaldırma ve anı fotoğrafları', icon: '◈' },
  { time: '18:00', title: 'Akşam Yemeği', desc: 'Özel menü ile birlikte sofra zevki', icon: '✦' },
  { time: '20:00', title: 'Düğün Pastası', desc: 'İlk dilim kesme ve kutlama', icon: '❋' },
  { time: '20:30', title: 'Müzik & Eğlence', desc: 'Canlı müzik ve dans keyfi', icon: '◇' },
];

export const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    q: 'Çocuklar davetli mi?',
    a: 'Düğünümüz yetişkinlere özel bir kutlama olarak planlanmıştır. Küçük misafirlerimizin olmamasını rica ediyoruz.',
  },
  {
    q: 'Otopark mevcut mu?',
    a: 'Mekan bünyesinde kapalı otopark bulunmaktadır. Ücretsiz olarak hizmet vermektedir.',
  },
  {
    q: 'Konaklama önerisi var mı?',
    a: 'Mekanın çevresinde birçok butik otel mevcuttur. Özel fiyatlar için bizimle iletişime geçebilirsiniz.',
  },
  {
    q: 'Düğün programı ne zaman başlıyor?',
    a: 'Kapılar 30 dk önce açılacak, tören belirtilen saatte başlayacaktır.',
  },
];

export const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=85',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=85',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900&q=85',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=900&q=85',
  'https://images.unsplash.com/photo-1470217957101-da7150b9b681?w=900&q=85',
];

/**
 * Sesler artık projenin kendi dosyalarıdır (`public/muzik/`).
 * Önceki varsayılan dışarıya bağlı bir adresti ve bugün 403 döndüğü için
 * hiçbir davetiyede müzik çalmıyordu.
 */
export const DEFAULT_MUSIC = '/muzik/piyano-sakin.mp3';
export const DEFAULT_SEAL_SOUND = '/muzik/muhur-kirilma.mp3';
export const DEFAULT_ENVELOPE_SOUND = '/muzik/zarf-acilma.mp3';

/** Davetiye formunun üzerinde çalıştığı alanlar (kimlik ve sahiplik hariç). */
export type InvitationDraft = Omit<
  Invitation,
  'id' | 'ownerId' | 'createdAt' | 'updatedAt'
>;

/** Formda ve önizlemede kullanılan boş davetiye taslağı. */
export function emptyInvitation(): InvitationDraft {
  return {
    slug: '',
    brideName: '',
    groomName: '',
    brideSurname: '',
    groomSurname: '',
    conjunction: '&',
    weddingDate: '',
    weddingTime: '16:00',
    weddingEndTime: '23:00',
    venueName: '',
    address: '',
    city: '',
    district: '',
    mapUrl: '',
    invitationText: READY_TEXTS[0].text,
    sealType: 'gold-wax',
    sealMonogram: '',
    sealImage: '',
    invitationDesign: 'ottoman',
    letterImage: '',
    coverImage: '',
    galleryImages: [],
    gallerySectionTitle: 'Fotoğraf Galerisi',
    gallerySectionSubtitle: 'Anılar',
    // Hediye bölümü varsayılan olarak kapalı: IBAN kişisel bir bilgidir,
    // çift açıkça açmadan davetiyede görünmemeli.
    giftEnabled: false,
    giftTitle: 'Hediye',
    giftNote: 'Varlığınız en büyük hediye. Yine de katkıda bulunmak isterseniz:',
    giftAccountName: '',
    giftIban: '',
    giftBankName: '',
    giftRegistryUrl: '',

    wishesEnabled: true,
    wishesTitle: 'Dilek Defteri',
    wishesSubtitle: 'Bize Bir Not Bırakın',

    soundEnabled: true,
    soundVolume: 50,
    backgroundMusicUrl: DEFAULT_MUSIC,
    sealBreakSound: DEFAULT_SEAL_SOUND,
    envelopeOpenSound: DEFAULT_ENVELOPE_SOUND,
    storySectionTitle: 'Hikayemiz',
    storySectionSubtitle: 'Bizim',
    storyItems: DEFAULT_STORY_ITEMS,
    programItems: DEFAULT_PROGRAM_ITEMS,
    faqItems: DEFAULT_FAQ_ITEMS,
    socialLinks: [],
    hashtag: '',
    rsvpDeadline: '',
    theme: 'cream-gold',
    isActive: true,
  };
}

/** Veri gelmediğinde davetiye sayfasının kullandığı örnek içerik. */
export const DEMO_INVITATION: Invitation = {
  ...emptyInvitation(),
  id: 'demo',
  ownerId: 'demo',
  slug: 'ayse-mehmet',
  brideName: 'Ayşe',
  groomName: 'Mehmet',
  brideSurname: 'Yılmaz',
  groomSurname: 'Kaya',
  weddingDate: '2026-02-14',
  weddingTime: '15:00',
  weddingEndTime: '22:00',
  venueName: 'The Grand Bosphorus',
  address: 'Çırağan Cad. No:32',
  city: 'İstanbul',
  district: 'Beşiktaş',
  sealMonogram: 'A & M',
  galleryImages: DEFAULT_GALLERY,
  hashtag: '#AyşeMehmet2026',
  socialLinks: [
    { name: 'Instagram', handle: '@aysemehmet2026', href: 'https://instagram.com' },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
