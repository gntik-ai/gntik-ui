import { Quote } from 'lucide-react';
import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { blockquoteVariants, type BlockquoteVariantProps } from './blockquote.variants';

export interface BlockquoteProps extends Omit<HTMLAttributes<HTMLElement>, 'className'>, BlockquoteVariantProps {
  className?: string;
  /** The quoted content. */
  children: ReactNode;
  /** Who said or wrote it (rendered in a `<cite>`). */
  source?: ReactNode;
  /** Role, company or publication shown after the source. */
  sourceDetail?: ReactNode;
  /** URL of the original; sets the blockquote `cite` attribute and links the source. */
  cite?: string;
  /** Leading media in the caption, e.g. an Avatar. */
  avatar?: ReactNode;
  /** Show a decorative quote mark (default on for the card and pull variants). */
  showMark?: boolean;
}

/**
 * Quoted content with its attribution: a `<figure>` holding the `<blockquote>` and a
 * `<figcaption>` whose `<cite>` names the source (linked when `cite` is a URL).
 */
export function Blockquote({ variant = 'default', className, children, source, sourceDetail, cite, avatar, showMark, ...props }: BlockquoteProps) {
  const s = blockquoteVariants({ variant });
  const mark = showMark ?? variant !== 'default';
  const hasCaption = source != null || sourceDetail != null;
  return (
    <figure className={cn(s.root(), className)} {...props}>
      {mark && <Quote size={variant === 'pull' ? 22 : 18} aria-hidden className={cn(s.mark(), variant === 'pull' ? 'mx-auto mb-3' : 'mb-2.5')} />}
      <blockquote cite={cite} className={s.quote()}>
        {children}
      </blockquote>
      {hasCaption && (
        <figcaption className={s.caption()}>
          {avatar && <span className={s.avatar()}>{avatar}</span>}
          <span className={s.source()}>
            {source != null && (
              <cite className={s.name()}>
                {cite ? (
                  <a href={cite} className={s.link()}>
                    {source}
                  </a>
                ) : (
                  source
                )}
              </cite>
            )}
            {sourceDetail != null && <span className={s.detail()}>{sourceDetail}</span>}
          </span>
        </figcaption>
      )}
    </figure>
  );
}
