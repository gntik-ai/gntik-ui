import { Button } from '../../Button';
import { SkipLink } from '../VisuallyHidden';

export default function SkipLinkPage() {
  return (
    <div className="relative max-w-[560px] overflow-hidden rounded-xl border border-border bg-background">
      <SkipLink targetId="skip-link-demo-main" className="focus:absolute" />
      <nav aria-label="Primary" className="flex gap-1 border-b border-border px-4 py-2">
        <Button variant="ghost" size="sm">Projects</Button>
        <Button variant="ghost" size="sm">Members</Button>
        <Button variant="ghost" size="sm">Billing</Button>
      </nav>
      <div id="skip-link-demo-main" className="px-4 py-5 text-[13px] text-muted-foreground focus:outline-none">
        Press Tab inside this preview: the skip link appears first and jumps straight here.
      </div>
    </div>
  );
}
