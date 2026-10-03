import { Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { Lightbox, type LightboxItem } from '../Lightbox';
import { media } from './media';

const items: LightboxItem[] = [
  {
    type: 'video',
    src: '/media/onboarding.mp4',
    poster: media[0]?.src,
    captions: '/media/onboarding.en.vtt',
    alt: 'Onboarding walkthrough video',
    caption: 'Onboarding · 2 min walkthrough',
  },
  ...media.slice(1, 3),
];

export default function LightboxWithVideo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" icon={Play} onClick={() => setOpen(true)}>
        Watch walkthrough
      </Button>
      <Lightbox items={items} open={open} onOpenChange={setOpen} loop labels={{ title: 'Onboarding media' }} />
    </>
  );
}
