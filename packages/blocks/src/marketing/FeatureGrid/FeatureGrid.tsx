import { useId, type ReactNode } from 'react';
import { cn } from '@gntik-ai/ui';
import type { LucideIcon } from '@gntik-ai/icons';
import { sampleFeatures } from './fixtures';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: ReactNode;
}

export interface FeatureGridProps {
  features?: Feature[];
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  /** Columns from `lg` (one column on phones, two on tablets). */
  columns?: 2 | 3 | 4;
  /** Heading level of the section title; feature titles use the next level. */
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

const COLS = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' } as const;

/** Features section: a heading block over a grid of icon + title + description. */
export function FeatureGrid({
  features = sampleFeatures,
  eyebrow = 'Everything included',
  title = 'All the building blocks, none of the glue code',
  description = 'The essentials every product needs, designed to work together from day one.',
  columns = 3,
  headingLevel: Heading = 'h2',
  className,
}: FeatureGridProps) {
  const titleId = useId();
  const ItemHeading = Heading === 'h2' ? 'h3' : 'h4';
  return (
    <section aria-labelledby={title ? titleId : undefined} className={cn('px-4 py-16 sm:px-6 sm:py-20', className)}>
      {(eyebrow || title || description) && (
        <div className="mx-auto max-w-2xl text-center">
          {eyebrow && <p className="font-mono text-[12px] font-semibold tracking-wide text-primary-text uppercase">{eyebrow}</p>}
          {title && (
            <Heading id={titleId} className="mt-2 text-[28px] leading-tight font-semibold tracking-tight text-balance text-foreground sm:text-[34px]">
              {title}
            </Heading>
          )}
          {description && <p className="mt-4 text-[15.5px] leading-relaxed text-pretty text-muted-foreground">{description}</p>}
        </div>
      )}
      <ul className={cn('mx-auto mt-12 grid max-w-6xl gap-x-8 gap-y-10 sm:grid-cols-2', COLS[columns])}>
        {features.map((f) => {
          const Glyph = f.icon;
          return (
            <li key={f.title} className="flex flex-col">
              <span aria-hidden className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/14 text-primary-chip-text">
                <Glyph size={19} />
              </span>
              <ItemHeading className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{f.title}</ItemHeading>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">{f.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
