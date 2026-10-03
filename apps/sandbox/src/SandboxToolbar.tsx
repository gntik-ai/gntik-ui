import { Check, Link2, Monitor, Smartphone, Tablet } from '@gntik-ai/icons';
import { Button, Logo, SimpleSelect, Toggle, ToggleGroup, type ResolvedTheme } from '@gntik-ai/ui';
import { EXAMPLES } from './examples';
import { BRANDS, THEMES, type BrandId } from './protocol';

export type DeviceWidth = 'mobile' | 'tablet' | 'desktop';

export const DEVICES: ReadonlyArray<{ value: DeviceWidth; label: string; icon: typeof Monitor; px: number | null }> = [
  { value: 'mobile', label: 'Mobile (390 px)', icon: Smartphone, px: 390 },
  { value: 'tablet', label: 'Tablet (768 px)', icon: Tablet, px: 768 },
  { value: 'desktop', label: 'Full width', icon: Monitor, px: null },
];

const EXAMPLE_ITEMS = EXAMPLES.map(({ id, label }) => ({ value: id, label }));

export interface SandboxToolbarProps {
  exampleId: string | null;
  onExample: (id: string) => void;
  theme: ResolvedTheme;
  onTheme: (theme: ResolvedTheme) => void;
  brand: BrandId;
  onBrand: (brand: BrandId) => void;
  device: DeviceWidth;
  onDevice: (device: DeviceWidth) => void;
  copied: boolean;
  onShare: () => void;
}

/** One toggle group whose pressed value can never be cleared. */
function single<T extends string>(next: string[], apply: (v: T) => void) {
  const v = next[0];
  if (v) apply(v as T);
}

/** Top bar: brand, example gallery, preview theme / brand / width, share. */
export function SandboxToolbar(p: SandboxToolbarProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-chrome px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <Logo size={24} wordmark />
        <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">sandbox</span>
      </div>
      <SimpleSelect
        aria-label="Example"
        size="sm"
        placeholder="Examples…"
        items={EXAMPLE_ITEMS}
        value={p.exampleId}
        onValueChange={(v) => v && p.onExample(v)}
        className="w-56"
      />
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <ToggleGroup aria-label="Preview theme" size="sm" value={[p.theme]} onValueChange={(v) => single(v, p.onTheme)}>
          {THEMES.map((t) => (
            <Toggle key={t.value} value={t.value}>
              {t.label}
            </Toggle>
          ))}
        </ToggleGroup>
        <SimpleSelect
          aria-label="Brand preset"
          size="sm"
          items={BRANDS}
          value={p.brand}
          onValueChange={(v) => v && p.onBrand(v)}
          className="w-36"
        />
        <ToggleGroup aria-label="Preview width" size="sm" value={[p.device]} onValueChange={(v) => single(v, p.onDevice)}>
          {DEVICES.map((d) => (
            <Toggle key={d.value} value={d.value} iconOnly aria-label={d.label}>
              <d.icon size={15} aria-hidden />
            </Toggle>
          ))}
        </ToggleGroup>
        <Button size="sm" variant="secondary" icon={p.copied ? Check : Link2} onClick={p.onShare}>
          {p.copied ? 'Link copied' : 'Copy link'}
        </Button>
      </div>
    </header>
  );
}
