/**
 * Çizilmiş süsleme ve ikon seti.
 *
 * Emoji yerine ince çizgili SVG kullanılır: emoji her cihazda başka bir
 * yazı tipiyle, başka bir renkte ve başka bir ağırlıkta görünür — tasarımın
 * kontrolü dışına çıkar. Buradaki her şey `currentColor` ile boyanır ve
 * sayfanın çizgi kalınlığına uyar.
 */

type IconProps = { size?: number; className?: string };

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* ─────────────────────────────────────────────────────── bölüm ikonları */

export function IconVenue({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M4 20h16M6 20V10l6-5 6 5v10" />
      <path {...stroke} d="M10 20v-5h4v5" />
      <path {...stroke} d="M12 2.5v2" />
    </svg>
  );
}

export function IconCalendar({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect {...stroke} x="3.5" y="5.5" width="17" height="15" rx="1.5" />
      <path {...stroke} d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function IconClock({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...stroke} cx="12" cy="12" r="8.5" />
      <path {...stroke} d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function IconPin({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 21c4-4.5 6-7.6 6-10.2A6 6 0 0 0 6 10.8C6 13.4 8 16.5 12 21Z" />
      <circle {...stroke} cx="12" cy="10.6" r="2.3" />
    </svg>
  );
}

export function IconRings({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...stroke} cx="9" cy="14" r="5.5" />
      <circle {...stroke} cx="15" cy="14" r="5.5" />
      <path {...stroke} d="M15 8.5 13.6 5h2.8L15 8.5Z" />
    </svg>
  );
}

export function IconGlass({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M7 3.5h10l-1 6a4 4 0 0 1-8 0l-1-6Z" />
      <path {...stroke} d="M12 13.5V20M8.5 20h7" />
    </svg>
  );
}

export function IconCake({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M4 20h16v-6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v6Z" />
      <path {...stroke} d="M4 16c2 0 2 1.4 4 1.4S10 16 12 16s2 1.4 4 1.4S18 16 20 16" />
      <path {...stroke} d="M12 11V7.5M12 5.2v.6" />
    </svg>
  );
}

export function IconMusic({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M9 18V5.5l10-2V16" />
      <circle {...stroke} cx="6.6" cy="18" r="2.6" />
      <circle {...stroke} cx="16.6" cy="16" r="2.6" />
    </svg>
  );
}

export function IconDoor({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M6 20V4.8a1 1 0 0 1 .8-1l9-1.6a1 1 0 0 1 1.2 1V20" />
      <path {...stroke} d="M4 20h16" />
      <circle cx="14" cy="12" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconCamera({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect {...stroke} x="3" y="7" width="18" height="13" rx="2" />
      <path {...stroke} d="M9 7l1.4-2.5h3.2L15 7" />
      <circle {...stroke} cx="12" cy="13.5" r="3.4" />
    </svg>
  );
}

export function IconEnvelope({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect {...stroke} x="3" y="5.5" width="18" height="13" rx="1.5" />
      <path {...stroke} d="m3.6 6.4 8.4 6.4 8.4-6.4" />
    </svg>
  );
}

export function IconLink({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7L11.8 6.5" />
      <path {...stroke} d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.3-1.3" />
    </svg>
  );
}

export function IconArrow({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

export function IconInstagram({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect {...stroke} x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle {...stroke} cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  );
}

/* Program ve hikâye satırlarında kullanılan ikon sözlüğü. */
export const ICONS = {
  door: IconDoor,
  rings: IconRings,
  glass: IconGlass,
  venue: IconVenue,
  cake: IconCake,
  music: IconMusic,
  camera: IconCamera,
  calendar: IconCalendar,
  clock: IconClock,
  pin: IconPin,
} as const;

export type IconName = keyof typeof ICONS;

/**
 * Eski kayıtlarda ikonlar tek karakterlik sembollerdi (✦ ◈ ◇ ❋ ♡).
 * Bunları çizilmiş karşılıklarına eşleriz; tanınmayan bir değer gelirse
 * sırayla dönen bir varsayılana düşer, böylece hiçbir satır ikonsuz kalmaz.
 */
const GLYPH_MAP: Record<string, IconName> = {
  '◇': 'door',
  '♡': 'rings',
  '◈': 'glass',
  '✦': 'venue',
  '❋': 'cake',
  '♫': 'music',
};

const FALLBACK: IconName[] = ['door', 'rings', 'glass', 'venue', 'cake', 'music'];

export function resolveIcon(glyph: string | undefined, index = 0): IconName {
  if (glyph && glyph in GLYPH_MAP) return GLYPH_MAP[glyph];
  if (glyph && glyph in ICONS) return glyph as IconName;
  return FALLBACK[index % FALLBACK.length];
}

/* ──────────────────────────────────────────────────── panel ikonları */

export function IconUser({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...stroke} cx="12" cy="8.5" r="3.8" />
      <path {...stroke} d="M4.5 20.5c0-3.9 3.4-6.4 7.5-6.4s7.5 2.5 7.5 6.4" />
    </svg>
  );
}

export function IconTrash({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5 7.5 20h9l1-13.5" />
      <path {...stroke} d="M10.5 10v6M13.5 10v6" />
    </svg>
  );
}

export function IconKey({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle {...stroke} cx="8" cy="12" r="4" />
      <path {...stroke} d="M12 12h8M17 12v3M20 12v2.5" />
    </svg>
  );
}

export function IconPlus({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconDownload({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
    </svg>
  );
}

export function IconQr({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect {...stroke} x="3.5" y="3.5" width="6.5" height="6.5" />
      <rect {...stroke} x="14" y="3.5" width="6.5" height="6.5" />
      <rect {...stroke} x="3.5" y="14" width="6.5" height="6.5" />
      <path {...stroke} d="M14 14h3v3h-3zM20.5 14v3M17.5 20.5h3" />
    </svg>
  );
}

export function IconEye({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" />
      <circle {...stroke} cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function IconPencil({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path {...stroke} d="m15 7 2 2" />
    </svg>
  );
}

export function IconPower({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 3.5v8" />
      <path {...stroke} d="M17.5 6.8a7.5 7.5 0 1 1-11 0" />
    </svg>
  );
}

export function IconWarning({ size = 26, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M12 3.5 21.5 20h-19L12 3.5Z" />
      <path {...stroke} d="M12 10v4.5" />
      <circle cx="12" cy="17.4" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconImage({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect {...stroke} x="3" y="5" width="18" height="14" rx="1.5" />
      <circle {...stroke} cx="8.5" cy="10" r="1.6" />
      <path {...stroke} d="m3.5 17 5-4.5 4 3.5 3.5-3 4.5 4" />
    </svg>
  );
}

export function IconCheck({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function IconClose({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path {...stroke} d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────── süsleme öğeleri */

/** İki yana sönümlenen çizgi ve ortasında küçük bir eşkenar dörtgen. */
export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden>
      <span className="rule-fade w-20 sm:w-32" />
      <svg width="9" height="9" viewBox="0 0 10 10">
        <path d="M5 0 10 5 5 10 0 5Z" fill="currentColor" opacity="0.75" />
      </svg>
      <span className="rule-fade w-20 sm:w-32" />
    </div>
  );
}

/**
 * Köşe filigranı — kâğıt kenarı hissi veren ince kıvrım.
 *
 * Çizim sol-üst köşe için yapılır; diğer köşeler DÖNDÜRÜLEREK elde edilir.
 * Yalnızca aynalamak kıvrımın yönünü bozar ve kırık görünür.
 */
const CORNER_ROTATION = {
  tl: 0,
  tr: 90,
  br: 180,
  bl: 270,
} as const;

export function CornerFlourish({
  className = '',
  corner = 'tl',
  size = 96,
}: {
  className?: string;
  corner?: keyof typeof CORNER_ROTATION;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      style={{ transform: `rotate(${CORNER_ROTATION[corner]}deg)` }}
      aria-hidden
    >
      <path {...stroke} strokeWidth={0.7} opacity={0.45} d="M2 26V2h24" />
      <path {...stroke} strokeWidth={0.7} opacity={0.3} d="M8 40V8h32" />
      <path
        {...stroke}
        strokeWidth={0.7}
        opacity={0.4}
        d="M2 44c0-14 6-22 20-24M44 2c-14 2-22 8-24 22"
      />
      <circle cx="20" cy="20" r="1.3" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

/** Bölüm numarası — editoryal ritmi taşıyan küçük seri numarası. */
export function SectionNumber({ n, className = '' }: { n: number; className?: string }) {
  return (
    <span className={`numerals ${className}`} aria-hidden>
      {String(n).padStart(2, '0')}
    </span>
  );
}
