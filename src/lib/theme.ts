import type { SealType, ThemeId } from './types';

export interface Palette {
  /** Açık bölümlerin zemini */
  surface: string;
  surfaceAlt: string;
  /** Koyu (hero / RSVP) bölümlerin zemini */
  dark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  text: string;
  textMuted: string;
}

const PALETTES: Record<ThemeId, Palette> = {
  'cream-gold': {
    surface: '#FAF6F0',
    surfaceAlt: '#F5EDD8',
    dark: 'linear-gradient(135deg, #1a0f08 0%, #2d1f12 30%, #1a110a 60%, #0d0805 100%)',
    accent: '#C9A84C',
    accentLight: '#E8D5A3',
    accentDark: '#9A7B2F',
    text: '#2b1d0f',
    textMuted: '#6b5a44',
  },
  'ottoman-premium': {
    surface: '#F3E9D6',
    surfaceAlt: '#E9DBC0',
    dark: 'linear-gradient(135deg, #1a0f08 0%, #34210f 40%, #120b05 100%)',
    accent: '#C9A84C',
    accentLight: '#F0DFAE',
    accentDark: '#8A6A22',
    text: '#241708',
    textMuted: '#6a5330',
  },
  'minimal-white': {
    surface: '#FFFFFF',
    surfaceAlt: '#F6F6F6',
    dark: 'linear-gradient(135deg, #2a2a2a 0%, #161616 100%)',
    accent: '#333333',
    accentLight: '#8a8a8a',
    accentDark: '#111111',
    text: '#1c1c1c',
    textMuted: '#6b6b6b',
  },
  'beige-gold': {
    surface: '#F5EDD8',
    surfaceAlt: '#EADFC2',
    dark: 'linear-gradient(135deg, #2a2013 0%, #3a2c18 50%, #1c150b 100%)',
    accent: '#9A7B2F',
    accentLight: '#D8BE7E',
    accentDark: '#6B4F1A',
    text: '#3a2c13',
    textMuted: '#7a6640',
  },
  'dark-premium': {
    surface: '#171009',
    surfaceAlt: '#1f160c',
    dark: 'linear-gradient(135deg, #0d0805 0%, #1d1409 50%, #0a0603 100%)',
    accent: '#E8D5A3',
    accentLight: '#F6ECD2',
    accentDark: '#B99C55',
    text: '#f2e8d6',
    textMuted: '#b3a180',
  },
};

export function palette(theme: ThemeId | undefined): Palette {
  return PALETTES[theme ?? 'cream-gold'] ?? PALETTES['cream-gold'];
}

/** Bir temanın açık zeminli mi koyu zeminli mi olduğunu söyler. */
export function isDarkTheme(theme: ThemeId | undefined): boolean {
  return theme === 'dark-premium';
}

export interface SealPalette {
  grad1: string;
  grad2: string;
  grad3: string;
  glow: string;
}

export const SEAL_PALETTES: Record<SealType, SealPalette> = {
  'gold-wax': {
    grad1: '#F5E6B8',
    grad2: '#C9A84C',
    grad3: '#6B4F1A',
    glow: 'rgba(201,168,76,0.7)',
  },
  'burgundy-wax': {
    grad1: '#E8A0A0',
    grad2: '#8B2635',
    grad3: '#3A0812',
    glow: 'rgba(139,38,53,0.7)',
  },
  'emerald-wax': {
    grad1: '#D4AF37',
    grad2: '#1B4332',
    grad3: '#0A1F14',
    glow: 'rgba(27,67,50,0.6)',
  },
  'bronze-wax': {
    grad1: '#F5EDE0',
    grad2: '#B8956A',
    grad3: '#5C4020',
    glow: 'rgba(184,149,106,0.6)',
  },
  'silver-wax': {
    grad1: '#F0EDE8',
    grad2: '#9A9088',
    grad3: '#4A4540',
    glow: 'rgba(154,144,136,0.5)',
  },
  'navy-wax': {
    grad1: '#A8BEDC',
    grad2: '#1E3A5F',
    grad3: '#0A1626',
    glow: 'rgba(30,58,95,0.65)',
  },
  'rose-wax': {
    grad1: '#F3CFC6',
    grad2: '#B76E79',
    grad3: '#5E2F36',
    glow: 'rgba(183,110,121,0.6)',
  },
  'ivory-wax': {
    grad1: '#FBF6EC',
    grad2: '#DDCFB4',
    grad3: '#8A7A5C',
    glow: 'rgba(221,207,180,0.55)',
  },
  ottoman: {
    grad1: '#F5E6B8',
    grad2: '#C9A84C',
    grad3: '#6B4F1A',
    glow: 'rgba(201,168,76,0.7)',
  },
};

export function sealPalette(seal: SealType | undefined): SealPalette {
  return SEAL_PALETTES[seal ?? 'gold-wax'] ?? SEAL_PALETTES['gold-wax'];
}

/* ══════════════════════════════════════════════════════════ tema simgeleri */

/**
 * Temanın davetiye sayfasına uygulanması.
 *
 * Tema sihirbazda beş seçenekle soruluyordu ama HİÇBİR yerde okunmuyordu:
 * seçim yapılıyor, ekranda hiçbir şey değişmiyordu. Artık tema, tasarım
 * simgelerini davetiye başına geçersiz kılıyor. Simgeler zaten tek merkezde
 * tanımlı olduğu için tek bir stil bloğu tüm sayfayı çeviriyor; bölümlerin
 * hiçbirine dokunmak gerekmiyor.
 *
 * Metin tonları her tema için ayrı ayrı verilir — açık bir temada koyu
 * zeminin tonunu kullanmak metni okunmaz yapardı.
 */
export interface ThemeTokens {
  night: string;
  ink: string;
  ember: string;
  bronze: string;
  tan: string;
  sand: string;
  cream: string;
  gold: string;
  goldLight: string;
  goldDeep: string;
  onLight: string;
  onDark: string;
  /** Kâğıdın ışık alan üst ucu — mektup kâğıdının geçişi burada başlar. */
  paperHi: string;
  /** Vellum katmanının iki ucu ve kenar çizgisi. */
  veilA: string;
  veilB: string;
  veilEdge: string;
  /** Monogramın varak geçişi. */
  foil: string;
  /** Köprünün ara durakları — gece ile kâğıt arasındaki üç ton. */
  bridgeA: string;
  bridgeB: string;
  bridgeC: string;
}

const TOKENS: Record<ThemeId, ThemeTokens> = {
  // Varsayılan: sıcak gece → krem yolculuğu.
  'cream-gold': {
    night: '#0d0805', ink: '#15100a', ember: '#2a1a0e', bronze: '#6b4a2a',
    tan: '#c4a077', sand: '#e6d9c2', cream: '#f2ebdc',
    gold: '#c39a48', goldLight: '#e8d5a4', goldDeep: '#5a4413',
    onLight: '#1f1409', onDark: '#f6efe1',
    paperHi: '#f9f4e9',
    veilA: 'rgba(255,255,255,0.55)', veilB: 'rgba(255,255,255,0.2)',
    veilEdge: 'rgba(255,255,255,0.6)',
    foil: 'linear-gradient(135deg, #6f551c 0%, #b8934a 42%, #61491a 100%)',
    bridgeA: '#4a2f18', bridgeB: '#9a7550', bridgeC: '#ddc9a8',
  },
  // Daha koyu, daha kırmızıya çalan gece; kâğıt biraz daha sarı.
  'ottoman-premium': {
    night: '#120802', ink: '#1d1006', ember: '#3a1e0b', bronze: '#7d5122',
    tan: '#cba36c', sand: '#e9dabb', cream: '#f5eddb',
    gold: '#cfa246', goldLight: '#f0dfae', goldDeep: '#54400f',
    onLight: '#241708', onDark: '#f8f0dd',
    paperHi: '#fbf5e6',
    veilA: 'rgba(255,255,255,0.55)', veilB: 'rgba(255,255,255,0.2)',
    veilEdge: 'rgba(255,255,255,0.62)',
    foil: 'linear-gradient(135deg, #664c12 0%, #b08f42 42%, #57420f 100%)',
    bridgeA: '#4f2d12', bridgeB: '#9d7448', bridgeC: '#e0c9a2',
  },
  // Nötr gri-siyah; altın yerine grafit vurgusu.
  'minimal-white': {
    night: '#141414', ink: '#1c1c1c', ember: '#2e2e2e', bronze: '#6e6e6e',
    tan: '#b6b6b6', sand: '#e8e8e8', cream: '#f7f7f7',
    gold: '#9a9a9a', goldLight: '#dcdcdc', goldDeep: '#3f3f3f',
    onLight: '#161616', onDark: '#f4f4f4',
    paperHi: '#ffffff',
    veilA: 'rgba(255,255,255,0.6)', veilB: 'rgba(255,255,255,0.24)',
    veilEdge: 'rgba(255,255,255,0.7)',
    foil: 'linear-gradient(135deg, #3f3f3f 0%, #7d7d7d 42%, #333333 100%)',
    bridgeA: '#3a3a3a', bridgeB: '#8f8f8f', bridgeC: '#dcdcdc',
  },
  // Bej ağırlıklı, altın daha koyu.
  'beige-gold': {
    night: '#1b140b', ink: '#241a0f', ember: '#3a2b17', bronze: '#7d6234',
    tan: '#cbb184', sand: '#e7dcc4', cream: '#f4eede',
    gold: '#b8913f', goldLight: '#e2cd97', goldDeep: '#54400f',
    onLight: '#261c0c', onDark: '#f6f0e2',
    paperHi: '#faf5ea',
    veilA: 'rgba(255,255,255,0.52)', veilB: 'rgba(255,255,255,0.18)',
    veilEdge: 'rgba(255,255,255,0.58)',
    foil: 'linear-gradient(135deg, #614a16 0%, #a98c45 42%, #554013 100%)',
    bridgeA: '#4a3a20', bridgeB: '#977d4e', bridgeC: '#ddccaa',
  },
  // Açık evre de koyu kalır: baştan sona gece.
  'dark-premium': {
    night: '#080503', ink: '#100b06', ember: '#1d140b', bronze: '#4a3620',
    tan: '#8a6f4a', sand: '#241a10', cream: '#2b2015',
    gold: '#d4b978', goldLight: '#f2e6c6', goldDeep: '#e8d5a3',
    onLight: '#f4ead6', onDark: '#f7efdd',
    paperHi: '#3a2c1d',
    veilA: 'rgba(232,213,163,0.12)', veilB: 'rgba(232,213,163,0.04)',
    veilEdge: 'rgba(232,213,163,0.28)',
    foil: 'linear-gradient(135deg, #b89a5c 0%, #f2e3b4 42%, #a98d52 100%)',
    bridgeA: '#140d07', bridgeB: '#1d1409', bridgeC: '#241a10',
  },
};

/** #rrggbb → rgba(r, g, b, a) */
function saydam(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Tema simgelerini satır içi stil nesnesine çevirir.
 *
 * Yumuşak/soluk metin tonları ve ince kural çizgileri BURADA türetiliyor.
 * Önce yalnızca ana renkler geçersiz kılınıyordu; globals.css'teki soluk
 * tonlar sabit koyu kahve kaldığı için koyu temada açık zeminin metni
 * kâğıdın rengine karışıyordu. Türetince her tema kendi tonunu taşıyor.
 */
export function themeStyle(theme: ThemeId | undefined): Record<string, string> {
  const t = TOKENS[theme ?? 'cream-gold'] ?? TOKENS['cream-gold'];
  return {
    '--c-night': t.night,
    '--c-ink': t.ink,
    '--c-ember': t.ember,
    '--c-bronze': t.bronze,
    '--c-tan': t.tan,
    '--c-sand': t.sand,
    '--c-cream': t.cream,
    '--c-gold': t.gold,
    '--c-gold-light': t.goldLight,
    '--c-gold-deep': t.goldDeep,
    '--c-on-light': t.onLight,
    '--c-on-light-soft': saydam(t.onLight, 0.92),
    '--c-on-light-faint': saydam(t.onLight, 0.78),
    '--c-on-dark': t.onDark,
    '--c-on-dark-soft': saydam(t.onDark, 0.88),
    '--c-on-dark-faint': saydam(t.onDark, 0.72),
    '--c-rule': saydam(t.goldDeep, 0.32),
    '--c-rule-dark': saydam(t.goldLight, 0.3),
    '--c-paper-hi': t.paperHi,
    '--c-veil-a': t.veilA,
    '--c-veil-b': t.veilB,
    '--c-veil-edge': t.veilEdge,
    '--c-foil': t.foil,
    '--c-bridge-a': t.bridgeA,
    '--c-bridge-b': t.bridgeB,
    '--c-bridge-c': t.bridgeC,
  };
}
