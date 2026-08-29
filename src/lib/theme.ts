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
