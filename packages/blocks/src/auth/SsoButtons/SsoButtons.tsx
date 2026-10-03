import { Button, cn } from '@gntik-ai/ui';
import { ssoProviders, type SsoProvider } from './fixtures';

export type { SsoProvider } from './fixtures';

export interface SsoButtonsProps {
  providers?: SsoProvider[];
  /** Called with the provider id. */
  onSelect?: (providerId: string) => void;
  /** Provider currently redirecting (shows a spinner and disables the others). */
  loadingId?: string | null;
  disabled?: boolean;
  /** `stack` (full-width rows, default) or `grid` (two columns from `sm`). */
  layout?: 'stack' | 'grid';
  /** Accessible name of the group. */
  label?: string;
  className?: string;
}

/** Neutral single-sign-on buttons: text labels and lucide icons, no brand colours or logos. */
export function SsoButtons({
  providers = ssoProviders,
  onSelect,
  loadingId = null,
  disabled = false,
  layout = 'stack',
  label = 'Single sign-on',
  className,
}: SsoButtonsProps) {
  return (
    <div role="group" aria-label={label} className={cn('grid gap-2.5', layout === 'grid' && 'sm:grid-cols-2', className)}>
      {providers.map((p) => (
        <Button
          key={p.id}
          variant="secondary"
          size="lg"
          icon={p.icon}
          loading={loadingId === p.id}
          disabled={disabled || (loadingId != null && loadingId !== p.id)}
          onClick={() => onSelect?.(p.id)}
          className="w-full text-[13.5px] font-medium"
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
}
