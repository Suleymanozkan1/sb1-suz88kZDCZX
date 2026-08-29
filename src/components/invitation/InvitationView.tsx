'use client';

import { useState } from 'react';
import ContactSection from './ContactSection';
import DetailsSection from './DetailsSection';
import FaqSection from './FaqSection';
import GallerySection from './GallerySection';
import Hero from './Hero';
import LetterSection from './LetterSection';
import LocationSection from './LocationSection';
import MusicPlayer from './MusicPlayer';
import ProgramSection from './ProgramSection';
import RsvpSection from './RsvpSection';
import ScrollProgress from './ScrollProgress';
import SealCurtain from './SealCurtain';
import StorySection from './StorySection';
import type { Invitation } from '@/lib/types';

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
}: {
  invitation: Invitation;
  skipIntro?: boolean;
}) {
  const [opened, setOpened] = useState(skipIntro);

  return (
    <>
      {!opened && <SealCurtain invitation={invitation} onOpened={() => setOpened(true)} />}

      <ScrollProgress />
      <div className="grain" aria-hidden />

      <main className="journey">
        <Hero invitation={invitation} />
        <LetterSection invitation={invitation} />
        <StorySection invitation={invitation} />
        <DetailsSection invitation={invitation} />
        <ProgramSection invitation={invitation} />
        <GallerySection invitation={invitation} />
        <LocationSection invitation={invitation} />
        <FaqSection invitation={invitation} />
        <RsvpSection invitation={invitation} />
        <ContactSection invitation={invitation} />
      </main>

      {invitation.soundEnabled && invitation.backgroundMusicUrl && (
        <MusicPlayer
          src={invitation.backgroundMusicUrl}
          volume={invitation.soundVolume}
          autoStart={opened && !skipIntro}
        />
      )}
    </>
  );
}
