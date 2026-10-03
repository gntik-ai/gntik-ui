import { ImageIcon } from 'lucide-react';
import { AspectRatio } from '../AspectRatio';

export default function AspectRatioMedia() {
  return (
    <div className="grid max-w-[560px] grid-cols-[2fr_1fr] items-start gap-4">
      <figure className="grid gap-2">
        <AspectRatio surface>
          <div className="flex items-center justify-center text-muted-foreground">
            <ImageIcon size={28} aria-hidden />
          </div>
        </AspectRatio>
        <figcaption className="text-[12px] text-muted-foreground">Release preview · 16:9</figcaption>
      </figure>
      <figure className="grid gap-2">
        <AspectRatio ratio={1} radius="xl" surface>
          <div className="flex items-center justify-center font-mono text-[12px] text-muted-foreground">1:1</div>
        </AspectRatio>
        <figcaption className="text-[12px] text-muted-foreground">Project avatar</figcaption>
      </figure>
    </div>
  );
}
