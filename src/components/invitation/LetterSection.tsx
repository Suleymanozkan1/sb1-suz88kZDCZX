'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { CornerFlourish, Divider } from './Ornaments';
import { BESMELE, READY_AYET, READY_HADIS } from '@/lib/defaults';
import { formatDate } from '@/lib/format';
import type { Invitation, InvitationDesign } from '@/lib/types';

const IN_VIEW = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-140px' },
};

/**
 * Mektup.
 *
 * Bölüm eskiden koyu zeminin üstünde savrulmuş bir metin yığınıydı: ne kâğıt
 * ne çerçeve vardı, "mektup nerede?" sorusu haklıydı. Ayrıca sihirbazda
 * toplanan iki alan hiçbir yerde kullanılmıyordu — letterImage (özel görsel)
 * ve invitationDesign (Osmanlı / Klasik / Minimal).
 *
 * Artık gecenin üstünde duran, ışık almış gerçek bir kâğıt. Biçim, basılı
 * davetiyelerin bugünkü diline yaslanıyor: kemerli üst kenar, elde yırtılmış
 * gibi tırtıklı alt kenar, arkada hafifçe kayan ikinci yaprak, tek bir altın
 * monogram. Süs yığmak yerine az sayıda güçlü hamle.
 */

type Kagit = {
  /** Üst kenar kemerli mi (kâğıdın silueti) */
  kemer: boolean;
  /** Köşe filigranları */
  suslu: boolean;
  /** İç kural çerçevesi */
  cerceve: boolean;
  /** Monogram altındaki elmas ayraç */
  ayrac: boolean;
  /** Yarı saydam vellum katmanı */
  vellum: boolean;
  /** Elde yırtılmış kenar */
  tirtik: boolean;
};

const KAGITLAR: Record<InvitationDesign, Kagit> = {
  // Osmanlı: kemer + köşe filigranı — en süslü olan.
  ottoman: { kemer: true, suslu: true, cerceve: true, ayrac: true, vellum: false, tirtik: true },
  // Klasik: düz kenar, çift kural, süs yok.
  classic: { kemer: false, suslu: false, cerceve: true, ayrac: true, vellum: false, tirtik: true },
  // Minimal: çerçevesiz, ayraçsız; yalnızca kâğıt ve boşluk.
  minimal: { kemer: false, suslu: false, cerceve: false, ayrac: false, vellum: false, tirtik: false },
  // Kemerli: Osmanlı'nın süssüz hâli — sadece siluet.
  arch: { kemer: true, suslu: false, cerceve: false, ayrac: true, vellum: false, tirtik: false },
  // Vellum: kâğıdın üstünde yarı saydam bir katman; 2026 kırtasiye dilinin
  // en belirgin işareti.
  vellum: { kemer: false, suslu: false, cerceve: true, ayrac: true, vellum: true, tirtik: true },
};

/** Elde yırtılmış kâğıt kenarı — üstteki zemin rengiyle kâğıdı "keser". */
function TirtikliKenar({ konum }: { konum: 'ust' | 'alt' }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-x-0 ${konum === 'ust' ? 'top-0' : 'bottom-0'}`}
      style={{ height: 9, transform: konum === 'ust' ? 'scaleY(-1)' : undefined }}
      viewBox="0 0 400 9"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        fill="var(--c-night)"
        d="M0 9h400V4.2c-9 1.6-15-1.3-24-.5-9 .9-13 3-22 2.6-9-.4-14-2.9-23-2.4-9 .5-14 3.4-23 3.2-9-.2-13-2.8-22-2.9-9 0-15 2.7-24 2.4-9-.3-12-3.2-21-3-9 .3-15 3.1-24 3-9-.2-13-3-22-2.8-9 .2-14 2.9-23 2.7-9-.3-13-2.6-22-2.6-9 .1-15 2.6-24 2.3-9-.4-12-3-21-2.9-9 .1-15 2.9-24 2.7-9-.1-13-2.7-22-2.6-9 .2-14 2.8-23 2.6-9-.2-13-2.5-22-2.5-9 .1-15 2.5-24 2.2-9-.4-12-2.9-21-2.8-9 .1-15 2.8-24 2.6V9Z"
      />
    </svg>
  );
}

export default function LetterSection({ invitation }: { invitation: Invitation }) {
  const conjunction = invitation.conjunction || '&';
  const monogram =
    invitation.sealMonogram?.trim() ||
    `${invitation.groomName?.[0] ?? ''} ${conjunction} ${invitation.brideName?.[0] ?? ''}`;

  const fullNames = [
    [invitation.groomName, invitation.groomSurname].filter(Boolean).join(' '),
    [invitation.brideName, invitation.brideSurname].filter(Boolean).join(' '),
  ].filter(Boolean);

  const kagit = KAGITLAR[invitation.invitationDesign] ?? KAGITLAR.classic;
  const gorsel = invitation.letterImage?.trim();

  // Kemer yalnızca üst kenarda; alt kenar düz kalır ki imza bloğu otursun.
  const kemerYaricap = kagit.kemer ? '50% 50% 0 0 / 16% 16% 0 0' : '0';

  return (
    <section id="letter" className="section-gap relative">
      <div className="relative mx-auto max-w-xl px-[var(--sp-md)]">
        {/* arkada hafifçe kayan ikinci yaprak — katmanlı kâğıt hissi */}
        <span
          className="pointer-events-none absolute inset-x-[var(--sp-md)] -bottom-3 top-6 hidden sm:block"
          style={{
            background: 'var(--c-rule)',
            borderRadius: kemerYaricap,
            transform: 'rotate(-1.2deg)',
          }}
          aria-hidden
        />

        <motion.article
          className="relative overflow-hidden px-[var(--sp-md)] pb-[var(--sp-lg)] pt-[var(--sp-lg)] text-center"
          style={{
            background:
              'linear-gradient(168deg, var(--c-paper-hi) 0%, var(--c-cream) 46%, var(--c-sand) 100%)',
            borderRadius: kemerYaricap,
            boxShadow: '0 36px 80px -34px rgba(0, 0, 0, 0.8)',
            color: 'var(--c-on-light)',
          }}
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-160px' }}
          transition={{ duration: 1.59, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* vellum — kâğıdın üstünde duran yarı saydam katman */}
          {kagit.vellum && (
            <span
              className="pointer-events-none absolute inset-x-6 inset-y-10"
              style={{
                background:
                  'linear-gradient(160deg, var(--c-veil-a) 0%, var(--c-veil-b) 100%)',
                border: '1px solid var(--c-veil-edge)',
                backdropFilter: 'blur(0.5px)',
              }}
              aria-hidden
            />
          )}

          {/* iç çerçeve — kâğıdın kenarından içeride duran ince kural */}
          {kagit.cerceve && (
            <span
              className="pointer-events-none absolute inset-4"
              style={{
                border: '1px solid var(--c-rule)',
                borderRadius: kagit.kemer ? '50% 50% 0 0 / 15% 15% 0 0' : '0',
              }}
              aria-hidden
            />
          )}

          {kagit.suslu && (
            <span style={{ color: 'var(--c-gold-deep)' }} aria-hidden>
              <CornerFlourish corner="bl" size={64} className="absolute bottom-5 left-5" />
              <CornerFlourish corner="br" size={64} className="absolute bottom-5 right-5" />
            </span>
          )}

          <div className="relative">
            {gorsel && (
              <motion.div
                className="relative mx-auto mb-[var(--sp-md)] aspect-[3/4] w-full max-w-[15rem] overflow-hidden"
                style={{
                  // Görsel de kemerli: kâğıdın biçimini tekrarlar.
                  borderRadius: '50% 50% 0 0 / 30% 30% 0 0',
                  border: '1px solid var(--c-rule)',
                }}
                {...IN_VIEW}
                transition={{ duration: 1.45 }}
              >
                <Image
                  src={gorsel}
                  // Süs değil, çiftin kendi seçtiği fotoğraf: boş alt metni
                  // ekran okuyucuda görseli tamamen yok sayardı.
                  alt={fullNames.length > 0 ? fullNames.join(` ${conjunction} `) : 'Çiftin fotoğrafı'}
                  fill
                  unoptimized
                  sizes="15rem"
                  className="object-cover"
                />
              </motion.div>
            )}

            {/* tek altın monogram — süsün tamamı burada toplanır */}
            <motion.p
              className="font-serif italic"
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                lineHeight: 1,
                // Varak hissi: tek renk yerine ışık alan bir altın geçişi.
                background: 'var(--c-foil)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
              {...IN_VIEW}
              transition={{ duration: 1.45 }}
            >
              {monogram}
            </motion.p>

            {invitation.showBesmele && (
              <motion.p
                className="mt-[var(--sp-sm)] font-serif text-xl"
                style={{ color: 'var(--c-gold-deep)', direction: 'rtl' }}
                {...IN_VIEW}
                transition={{ duration: 1.45, delay: 0.05 }}
              >
                {BESMELE}
              </motion.p>
            )}

            {kagit.ayrac && (
              <motion.div
                className="mt-[var(--sp-sm)]"
                style={{ color: 'var(--c-gold-deep)' }}
                {...IN_VIEW}
                transition={{ duration: 1.45, delay: 0.1 }}
              >
                <Divider />
              </motion.div>
            )}

            {invitation.invitationText && (
              <motion.p
                className="mx-auto mt-[var(--sp-md)] italic"
                style={{
                  color: 'var(--c-on-light)',
                  fontFamily: 'var(--f-display)',
                  fontSize: 'clamp(1.15rem, 2.2vw, 1.6rem)',
                  lineHeight: 1.55,
                  maxWidth: '26em',
                }}
                {...IN_VIEW}
                transition={{ duration: 1.59, delay: 0.15 }}
              >
                {invitation.invitationText}
              </motion.p>
            )}

            {(invitation.showAyet || invitation.showHadis || invitation.duaText) && (
              <motion.div
                className="mx-auto mt-[var(--sp-md)] max-w-md space-y-3"
                {...IN_VIEW}
                transition={{ duration: 1.45, delay: 0.2 }}
              >
                {invitation.showAyet && (
                  <p className="t-body italic" style={{ color: 'var(--c-on-light-soft)' }}>
                    {READY_AYET}
                  </p>
                )}
                {invitation.showHadis && (
                  <p className="t-body italic" style={{ color: 'var(--c-on-light-soft)' }}>
                    {READY_HADIS}
                  </p>
                )}
                {invitation.duaText && (
                  <p className="t-body" style={{ color: 'var(--c-on-light-soft)' }}>
                    {invitation.duaText}
                  </p>
                )}
                {invitation.religiousSource && (
                  <p className="t-label" style={{ color: 'var(--c-gold-deep)' }}>
                    {invitation.religiousSource}
                  </p>
                )}
              </motion.div>
            )}

            {/* imza bloğu */}
            <motion.div
              className="mt-[var(--sp-lg)]"
              {...IN_VIEW}
              transition={{ duration: 1.45, delay: 0.25 }}
            >
              <span
                className="mx-auto block h-8 w-px"
                style={{ background: 'var(--c-rule)' }}
                aria-hidden
              />

              {fullNames.length > 0 && (
                <p
                  className="mt-[var(--sp-sm)] font-serif"
                  style={{ color: 'var(--c-on-light)', fontSize: 'clamp(1rem, 1.7vw, 1.2rem)' }}
                >
                  {fullNames.join(`  ${conjunction}  `)}
                </p>
              )}

              <p className="numerals mt-2 text-sm" style={{ color: 'var(--c-on-light-faint)' }}>
                {[formatDate(invitation.weddingDate), invitation.city].filter(Boolean).join(' · ')}
              </p>
            </motion.div>
          </div>

          {/* elde yırtılmış kenar */}
          {kagit.tirtik && <TirtikliKenar konum="alt" />}
          {kagit.tirtik && !kagit.kemer && <TirtikliKenar konum="ust" />}
        </motion.article>
      </div>
    </section>
  );
}
