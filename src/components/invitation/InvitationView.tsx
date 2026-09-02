'use client';

import { useState } from 'react';
import ContactSection from './ContactSection';
import DetailsSection from './DetailsSection';
import ChildrenNote from './ChildrenNote';
import FamilySection from './FamilySection';
import MenuSection from './MenuSection';
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
  brand,
}: {
  invitation: Invitation;
  skipIntro?: boolean;
  /** Onaylanmış dilekler; sunucuda okunup buraya verilir. */
  wishes?: Wish[];
  /** İşletmenin kendi hesabı — ayardan gelir, davetiyeden değil. */
  brand?: { instagram: string; instagramLabel: string };
}) {
  const [opened, setOpened] = useState(skipIntro);

  /*
   * Bölüm numarası sabit yazılamaz: bölümler kapatılabiliyor ve kapalı
   * olanın numarası boşluk bırakıyordu — "01, 03, 06" diye giden bir
   * davetiye. Numara çizim sırasında veriliyor.
   *
   * Bölüm kendi içinde de gizlenebilir (içeriği boşsa), bu yüzden sayaç
   * yalnızca GÖRÜNECEK bölümler için ilerletiliyor.
   */
  const no = (() => {
    let i = 0;
    return () => (i += 1);
  })();

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
          {invitation.showLetter && <LetterSection invitation={invitation} />}
        </div>

        <Bridge direction="toLight" />

        <div className="phase-light">
          {invitation.showStory && invitation.storyItems.length > 0 && (
            <StorySection invitation={invitation} n={no()} />
          )}
          {invitation.showDetails && <DetailsSection invitation={invitation} n={no()} />}
          {invitation.showProgram && invitation.programItems.length > 0 && (
            <ProgramSection invitation={invitation} n={no()} />
          )}
          {invitation.showMenu && invitation.menuGroups.length > 0 && (
            <MenuSection invitation={invitation} n={no()} />
          )}
          {invitation.showGallery && invitation.galleryImages.length > 0 && (
            <GallerySection invitation={invitation} n={no()} />
          )}
          {invitation.showLocation && (invitation.venueName || invitation.address) && (
            <LocationSection invitation={invitation} n={no()} />
          )}
          {invitation.showFamily && (invitation.brideFamilyText || invitation.groomFamilyText) && (
            <FamilySection invitation={invitation} n={no()} />
          )}
          <ChildrenNote invitation={invitation} />
        </div>

        <Bridge direction="toDark" />

        <div className="phase-dark">
          {invitation.showRsvp && <RsvpSection invitation={invitation} n={no()} />}
          {invitation.giftEnabled && (invitation.giftIban || invitation.giftRegistryUrl) && (
            <GiftSection invitation={invitation} n={no()} />
          )}
          {invitation.wishesEnabled && (
            <WishesSection invitation={invitation} wishes={wishes} n={no()} />
          )}
          {invitation.showContact && <ContactSection invitation={invitation} brand={brand} />}
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
