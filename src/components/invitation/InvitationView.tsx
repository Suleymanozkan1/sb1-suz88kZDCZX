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
import Petals from './Petals';
import ProgramSection from './ProgramSection';
import RsvpSection from './RsvpSection';
import ScrollProgress from './ScrollProgress';
import SealCurtain from './SealCurtain';
import StorySection from './StorySection';
import type { Invitation } from '@/lib/types';

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
      <Petals />

      <main>
        <Hero invitation={invitation} />
        <LetterSection invitation={invitation} />
        <StorySection invitation={invitation} />
        <DetailsSection invitation={invitation} />
        <ProgramSection invitation={invitation} />
        <GallerySection invitation={invitation} />
        <LocationSection invitation={invitation} />
        <RsvpSection invitation={invitation} />
        <FaqSection invitation={invitation} />
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
