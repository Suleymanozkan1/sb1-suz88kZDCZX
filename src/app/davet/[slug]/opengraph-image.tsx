import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { formatDate } from '@/lib/format';
import { siteUrl } from '@/lib/site-url';
import { getInvitationBySlug } from '@/lib/store';
import { sealPalette, themeStyle } from '@/lib/theme';

/**
 * Davetiyenin paylaşım kartı.
 *
 * Davetiye WhatsApp'ta, Instagram DM'inde ya da SMS'te paylaşıldığında
 * çıkan görsel. Eskiden yoktu: bağlantı görselsiz, düz gri bir satır
 * olarak görünüyordu — davetiyenin ilk izlenimi orasıyken.
 *
 * Kart, davetiyenin kendi temasını ve mühür rengini kullanır; çift bir
 * kapak fotoğrafı yüklediyse fotoğraf zemine geçer, üstüne metnin
 * okunmasını sağlayan bir koyu perde iner.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const alt = 'Düğün Davetiyesi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/*
  Yazı tipi diskten okunuyor.

  Belgelerdeki `fetch(new URL('./font.ttf', import.meta.url))` kalıbı yalnızca
  edge çalışma zamanında işe yarıyor: node tarafında bu ifade mutlak bir adres
  değil `/_next/static/media/...` yolunu veriyor ve fetch "Invalid URL" ile
  düşüyor. Bu rota veritabanına eriştiği (pg edge'de çalışmaz) için node'da
  kalmak zorunda, o yüzden dosya doğrudan okunuyor. Dosyanın sunucu paketine
  girmesini next.config.mjs'teki outputFileTracingIncludes sağlıyor.
*/
const yaziTipi = readFile(path.join(process.cwd(), 'src/assets/cormorant-600.ttf'));

/** #rrggbb → WCAG bağıl parlaklık */
function parlaklik(hex: string): number {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  const kanal = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * kanal[0] + 0.7152 * kanal[1] + 0.0722 * kanal[2];
}

/**
 * #rrggbb → rgba(...).
 *
 * Satori 8 haneli hex'i (#0d0805dd) sessizce yok sayıyor: fotoğrafın
 * üstündeki perde hiç çizilmiyor, isimler fotoğrafın üstünde kayboluyordu.
 */
function saydam(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** İki aday arasından zemine göre daha okunaklı olanı seçer. */
function okunur(zemin: string, a: string, b: string): string {
  const z = parlaklik(zemin);
  const oran = (renk: string) => {
    const l = parlaklik(renk);
    const [ust, alt] = l > z ? [l, z] : [z, l];
    return (ust + 0.05) / (alt + 0.05);
  };
  return oran(a) >= oran(b) ? a : b;
}

/** Görsel yolunu satori'nin çekebileceği mutlak adrese çevirir. */
function mutlak(yol: string | undefined): string | null {
  const temiz = yol?.trim();
  if (!temiz) return null;
  if (/^https?:\/\//.test(temiz)) return temiz;
  return temiz.startsWith('/') ? `${siteUrl()}${temiz}` : null;
}

export default async function Image({ params }: { params: { slug: string } }) {
  const invitation = await getInvitationBySlug(params.slug);
  const font = await yaziTipi;

  const ortak = {
    fonts: [{ name: 'Cormorant', data: font, weight: 600 as const, style: 'normal' as const }],
    ...size,
  };

  if (!invitation || !invitation.isActive) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0d0805',
            color: '#c39a48',
            fontFamily: 'Cormorant',
            fontSize: 64,
          }}
        >
          Sahra Davetiye
        </div>
      ),
      ortak,
    );
  }

  const t = themeStyle(invitation.theme);
  const gece = t['--c-night'];
  const altinKoyu = t['--c-gold'];
  const altinAcik = t['--c-gold-light'];
  const acik = t['--c-on-dark'];
  const muhur = sealPalette(invitation.sealType);

  const conjunction = invitation.conjunction || '&';
  const isimler = `${invitation.brideName ?? ''} ${conjunction} ${invitation.groomName ?? ''}`.trim();
  const altBaslik = [formatDate(invitation.weddingDate), invitation.city].filter(Boolean).join(' · ');
  const monogram =
    invitation.sealMonogram?.trim() ||
    `${invitation.brideName?.[0] ?? ''}${invitation.groomName?.[0] ?? ''}`;

  const fotograf = mutlak(invitation.coverImage) ??
    mutlak(invitation.letterImage) ??
    mutlak(invitation.galleryImages?.[0]);

  /*
     Fotoğrafın üstünde koyu altın ölçümde 3.59:1'de kalıyordu; 22px harf
     aralıklı etiket için eşik 4.5:1. Fotoğraf ne olursa olsun okunması
     gerektiği için hem perde koyulaştırıldı hem de altının açık tonuna
     geçiliyor.
  */
  const altin = fotograf ? altinAcik : altinKoyu;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: gece,
          fontFamily: 'Cormorant',
        }}
      >
        {fotograf && (
          // next/image ImageResponse içinde çalışmaz: satori düz <img> bekler.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotograf}
            alt=""
            width={size.width}
            height={size.height}
            style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }}
          />
        )}

        {/*
          Fotoğrafın üstündeki perde — metnin okunması buna bağlı.

          Konum `inset: 0` ile veriliyordu; satori bu kısayolu tanımadığı için
          perde sıfır boyutta kalıyor, isimler fotoğrafın üstünde eriyordu.
          Kenarlar tek tek, gradyan da `backgroundImage` ile verilmeli.
        */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size.width,
            height: size.height,
            display: 'flex',
            backgroundImage: fotograf
              ? `linear-gradient(180deg, ${saydam(gece, 0.9)} 0%, ${saydam(gece, 0.86)} 42%, ${saydam(gece, 0.97)} 100%)`
              : `linear-gradient(160deg, ${gece} 0%, ${saydam(muhur.grad3, 0.4)} 55%, ${gece} 100%)`,
          }}
        />

        {/* İnce altın çerçeve */}
        <div
          style={{
            position: 'absolute',
            top: 28,
            right: 28,
            bottom: 28,
            left: 28,
            display: 'flex',
            border: `1px solid ${saydam(altin, 0.35)}`,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {/* Mühür madalyonu */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 96,
              height: 96,
              borderRadius: 48,
              background: muhur.grad2,
              border: `2px solid ${muhur.grad1}`,
              // Fildişi gibi açık mühürlerde koyu, bordo gibi koyularda açık
              // monogram gerekiyor; sabit bir renk birinde mutlaka siliniyordu.
              color: okunur(muhur.grad2, muhur.grad1, muhur.grad3),
              fontSize: 38,
              letterSpacing: 2,
            }}
          >
            {monogram}
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 30,
              color: altin,
              fontSize: 22,
              letterSpacing: 10,
            }}
          >
            DÜĞÜNÜMÜZE DAVETLİSİNİZ
          </div>

          <div
            style={{
              display: 'flex',
              marginTop: 18,
              color: acik,
              fontSize: isimler.length > 30 ? 76 : 96,
              lineHeight: 1.1,
              textAlign: 'center',
              maxWidth: 1000,
            }}
          >
            {isimler}
          </div>

          {altBaslik && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 26 }}>
              <div style={{ display: 'flex', width: 90, height: 1, background: saydam(altin, 0.5) }} />
              <div style={{ display: 'flex', color: altin, fontSize: 30, padding: '0 22px' }}>
                {altBaslik}
              </div>
              <div style={{ display: 'flex', width: 90, height: 1, background: saydam(altin, 0.5) }} />
            </div>
          )}
        </div>
      </div>
    ),
    ortak,
  );
}
