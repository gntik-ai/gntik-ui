import type { ReactNode } from 'react';
import { Badge, cn } from '@gntik-ai/ui';
import { ArrowRight } from '@gntik-ai/icons';
import { ActionButton, type MarketingAction } from '../actions';

export interface HeroProps {
  /** `centered` (copy over the media) or `split` (copy left, media right from `lg`). */
  variant?: 'centered' | 'split';
  /** Small label above the title. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  primaryAction?: MarketingAction | null;
  secondaryAction?: MarketingAction | null;
  /** Screenshot slot. Defaults to a neutral app-window placeholder; null hides it. */
  media?: ReactNode;
  /** Heading level of the title. */
  headingLevel?: 'h1' | 'h2';
  className?: string;
}

/** Neutral app-window placeholder for the screenshot slot (decorative). */
export function HeroScreenshotPlaceholder({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('overflow-hidden rounded-xl border border-border bg-card shadow-sm', className)}>
      <div className="flex h-9 items-center gap-1.5 border-b border-border bg-secondary/40 px-3">
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="flex">
        <div className="hidden w-36 shrink-0 space-y-2 border-r border-border bg-secondary/30 p-3 sm:block">
          {[70, 55, 80, 60, 45].map((w, i) => (
            <div key={i} className={cn('h-2 rounded-full', i === 0 ? 'bg-primary/60' : 'bg-muted-foreground/20')} style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="min-w-0 flex-1 space-y-4 p-4">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-3">
                <div className="h-1.5 w-1/2 rounded-full bg-muted-foreground/25" />
                <div className="h-3 w-3/4 rounded-full bg-foreground/20" />
              </div>
            ))}
          </div>
          <div className="flex h-28 items-end gap-1.5 rounded-lg border border-border p-3">
            {[40, 55, 35, 70, 60, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-primary/50" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Landing hero: eyebrow, title, description, two calls to action and a screenshot slot. */
export function Hero({
  variant = 'centered',
  eyebrow = 'New · Usage-based billing',
  title = 'Ship your product faster, with less to maintain',
  description = 'Projects, deployments and team access in one place. Start in minutes, scale without rewriting, and keep every change reviewable.',
  primaryAction = { label: 'Get started', href: '#get-started', icon: ArrowRight },
  secondaryAction = { label: 'Book a demo', href: '#demo' },
  media,
  headingLevel: Heading = 'h1',
  className,
}: HeroProps) {
  const split = variant === 'split';
  const slot = media === undefined ? <HeroScreenshotPlaceholder /> : media;
  return (
    <section
      className={cn(
        'px-4 py-16 sm:px-6 sm:py-24',
        split ? 'grid items-center gap-12 lg:grid-cols-2 lg:gap-16' : 'flex flex-col items-center text-center',
        className,
      )}
    >
      <div className={cn('min-w-0', !split && 'flex max-w-3xl flex-col items-center')}>
        {eyebrow && (
          <Badge tone="primary" size="lg" shape="pill" dot>
            {eyebrow}
          </Badge>
        )}
        <Heading className="mt-5 text-[36px] leading-[1.1] font-semibold tracking-tight text-balance text-foreground sm:text-[48px]">
          {title}
        </Heading>
        {description && <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-pretty text-muted-foreground sm:text-[17px]">{description}</p>}
        {(primaryAction || secondaryAction) && (
          <div className={cn('mt-8 flex flex-wrap items-center gap-3', !split && 'justify-center')}>
            {primaryAction && <ActionButton action={primaryAction} variant="primary" />}
            {secondaryAction && <ActionButton action={secondaryAction} variant="secondary" />}
          </div>
        )}
      </div>
      {slot && <div className={cn('w-full min-w-0', !split && 'mt-14 max-w-5xl')}>{slot}</div>}
    </section>
  );
}
