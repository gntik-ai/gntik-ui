import { useState } from 'react';
import { Lightbox } from '../Lightbox';
import { media } from './media';

export default function LightboxGallery() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <div className="flex max-w-xl flex-col gap-2">
      <h3 className="text-[13px] font-semibold text-foreground">Release screenshots</h3>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {media.map((m, i) => (
          <li key={m.src}>
            <button
              type="button"
              aria-label={`Open ${m.alt}`}
              className="block w-full overflow-hidden rounded-lg border border-border bg-card text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              onClick={() => {
                setIndex(i);
                setOpen(true);
              }}
            >
              <img src={m.src} alt="" className="aspect-[16/10] w-full object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox items={media} open={open} onOpenChange={setOpen} index={index} onIndexChange={setIndex} />
    </div>
  );
}
