'use client';

import { useState } from 'react';
import ContactSection from './ContactSection';
import DetailsSection from './DetailsSection';
import FaqSection from './FaqSection';
import GallerySection from './GallerySection';
import Hero from './Hero';
import LetterSection from './LetterSection';
import LocationSection from './LocationSection';
import Bridge from './Bridge';
import GiftSection from './GiftSection';
import MusicPlayer from './MusicPlayer';
import WishesSection from './WishesSection';
import ProgramSection from './ProgramSection';
import RsvpSection from './RsvpSection';
import ScrollProgress from './ScrollProgress';
import SealCurtain from './SealCurtain';
import StorySection from './StorySection';
import { themeStyle } from '@/lib/theme';
import type { Invitation, Wish } from '@/lib/types';

/**
 * Davetiyenin tam akışı.
 *
 * Bölüm sırası bir renk yolculuğu izler: gece (açılış) → şafak (mektup) →
 * gündüz (hikâye, detay, program, galeri, konum, sorular) → akşam
 * (katılım, kapanış). Zemin `globals.css` içindeki tek gövde gradyanıyla
 * kesintisiz döner; bu yüzden bölümlerin kendi arka planı yoktur.
 *
 * Katılım formu bilinçli olarak soruların ARDINDAN gelir: önce merak
 * giderilir, sonra tek eylem istenir.
 */
export default function InvitationView({
  invitation,
  skipIntro = false,
  wishes = [],
}: {
  invitation: Invitation;
  skipIntro?: boolean;
  /** Onaylanmış dilekler; sunucuda okunup buraya verilir. */
  wishes?: Wish[];
}) {
  const [opened, setOpened] = useState(skipIntro);

  return (
    // Tema simgeleri en dışta veriliyor: mühür perdesi ve müzik düğmesi de
    // <main> dışında durduğu için, simgeler yalnızca <main>'de kalsaydı
    // davetiye çevrilirken perde eski renkte açılırdı.
    <div style={themeStyle(invitation.theme) as React.CSSProperties}>
      {!opened && <SealCurtain invitation={invitation} onOpened={() => setOpened(true)} />}

      <ScrollProgress />
      <div className="grain" aria-hidden />

      {/*
        Sayfa üç evreye bölünür ve renk yalnızca köprülerde döner. Evrelerin
        kendi düz zemini vardır, yani bir bölüme içerik eklenmesi başka bir
        bölümün zeminini kaydırmaz.
      */}
      {/*
        Tema, tasarım simgelerini bu sarmalayıcıda geçersiz kılar. Simgeler
        tek merkezde tanımlı olduğu için bölümlerin hiçbirine dokunmadan
        tüm sayfa çevrilir.
      */}
      <main className="journey">
        <div className="phase-dark">
          <Hero invitation={invitation} />
          <LetterSection invitation={invitation} />
        </div>

        <Bridge direction="toLight" />

        <div className="phase-light">
          <StorySection invitation={invitation} />
          <DetailsSection invitation={invitation} />
          <ProgramSection invitation={invitation} />
          <GallerySection invitation={invitation} />
          <LocationSection invitation={invitation} />
          <FaqSection invitation={invitation} />
        </div>

        <Bridge direction="toDark" />

        <div className="phase-dark">
          <RsvpSection invitation={invitation} />
          <GiftSection invitation={invitation} />
          <WishesSection invitation={invitation} wishes={wishes} />
          <ContactSection invitation={invitation} />
        </div>
      </main>

      {invitation.soundEnabled && invitation.backgroundMusicUrl && (
        <MusicPlayer
          src={invitation.backgroundMusicUrl}
          volume={invitation.soundVolume}
          autoStart={opened && !skipIntro}
        />
      )}
    </div>
  );
}
