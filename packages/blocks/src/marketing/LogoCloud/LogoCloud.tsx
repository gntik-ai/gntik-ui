import { useId, type ReactNode } from 'react';
import { cn, useI18n } from '@gntik-ai/ui';

export interface LogoCloudItem {
  id: string;
  name: string;
  /** Supply a single-colour SVG painted with currentColor. */
  mark: ReactNode;
  /** Optional token colour override for this mark. Otherwise inherits the root colour. */
  className?: string;
}

export interface LogoCloudProps {
  /** Customer marks. Empty arrays render nothing. */
  logos: LogoCloudItem[];
  /** Accessible list name; defaults to the active locale's catalog caption. */
  caption?: ReactNode;
  /** Above at every width, or beside the logos from md. */
  captionPlacement?: 'above' | 'start';
  /** A centred wrapping row (default) or a responsive grid. */
  layout?: 'row' | 'grid';
  /** Desktop column count in grid layout; phones always use two columns. */
  columns?: 3 | 4 | 6;
  /** Mark height in pixels. Width remains automatic and constrained to the available space. */
  logoHeight?: number;
  /** Root utilities; text-foreground overrides the default muted mark colour. */
  className?: string;
}

const gridColumns = { 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 6: 'md:grid-cols-6' };

/** Static social proof. Marks inherit the root token colour unless an item overrides it. */
export function LogoCloud({
  logos,
  caption,
  captionPlacement = 'above',
  layout = 'row',
  columns = 4,
  logoHeight = 28,
  className,
}: LogoCloudProps) {
  const captionId = useId();
  const { t } = useI18n();
  if (logos.length === 0) return null;
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col items-center gap-6 px-4 py-10 text-muted-foreground sm:px-6',
        captionPlacement === 'start' && 'md:flex-row md:items-center',
        className,
      )}
    >
      <div
        id={captionId}
        className={cn(
          'min-w-0 text-center text-sm wrap-anywhere',
          captionPlacement === 'start' && 'md:max-w-64 md:shrink-0 md:text-start',
        )}
      >
        {caption ?? t('logoCloud.caption')}
      </div>
      <ul
        aria-labelledby={captionId}
        className={cn(
          'm-0 w-full min-w-0 list-none items-center gap-x-8 gap-y-6 p-0',
          layout === 'grid' ? cn('grid grid-cols-2', gridColumns[columns]) : 'flex flex-wrap justify-center',
        )}
      >
        {logos.map((logo) => (
          <li key={logo.id} className={cn('flex min-w-0 max-w-full justify-center', logo.className)}>
            <div
              role="img"
              aria-label={logo.name}
              className="flex min-w-0 max-w-full justify-center"
              style={{ height: logoHeight }}
            >
              <span
                aria-hidden="true"
                className="inline-flex h-full min-w-0 max-w-full [&_svg]:h-full [&_svg]:w-auto [&_svg]:max-w-full"
              >
                {logo.mark}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
