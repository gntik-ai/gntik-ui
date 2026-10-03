import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '../../utils/cn';
import { headingVariants, textVariants } from './text.variants';

export type TextVariant = 'body' | 'label' | 'supporting' | 'caption' | 'code' | 'display';
export type TextTone = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'destructive' | 'inherit';

/** Tone each variant uses when `tone` is not set. */
const DEFAULT_TONE: Record<TextVariant, TextTone> = {
  body: 'default',
  label: 'default',
  supporting: 'muted',
  caption: 'muted',
  code: 'default',
  display: 'default',
};

const DEFAULT_TAG: Record<TextVariant, 'p' | 'span' | 'code'> = {
  body: 'p',
  label: 'span',
  supporting: 'p',
  caption: 'span',
  code: 'code',
  display: 'p',
};

export interface TextProps extends Omit<useRender.ComponentProps<'p'>, 'className'> {
  className?: string;
  /** Type role. Default `body`. */
  variant?: TextVariant;
  /** Colour role; brand / status tones use the contrast-safe `*-text` aliases. Defaults per variant. */
  tone?: TextTone;
  /** Tag to render; defaults per variant (p, span or code). `render` wins when both are set. */
  as?: 'p' | 'span' | 'div' | 'code' | 'small' | 'strong' | 'em' | 'label' | 'dt' | 'dd' | 'li' | 'figcaption';
  /** Single line with an ellipsis. */
  truncate?: boolean;
  /** Clamp to N lines (1–6) with an ellipsis. */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** Body copy and small type roles: body, label, supporting, caption, code and display. */
export function Text({
  variant = 'body',
  tone,
  as,
  truncate,
  lineClamp,
  className,
  render,
  ref,
  ...props
}: TextProps) {
  return useRender({
    defaultTagName: as ?? DEFAULT_TAG[variant],
    render,
    ref,
    props: mergeProps<'p'>(props, {
      className: cn(textVariants({ variant, tone: tone ?? DEFAULT_TONE[variant], truncate, lineClamp }), className),
    }),
  });
}

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = 'display' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | '2xs';

const LEVEL_SIZE: Record<HeadingLevel, HeadingSize> = { 1: 'xl', 2: 'lg', 3: 'md', 4: 'sm', 5: 'xs', 6: '2xs' };

export interface HeadingProps extends Omit<useRender.ComponentProps<'h2'>, 'className'> {
  className?: string;
  /** Semantic level (h1–h6) that fits the page outline. Default 2. */
  level?: HeadingLevel;
  /** Visual size, independent of the level. Defaults to the level's size. */
  size?: HeadingSize;
  tone?: 'default' | 'muted' | 'primary' | 'inherit';
  truncate?: boolean;
  lineClamp?: 1 | 2 | 3;
}

/** Section and page titles: the semantic level and the visual size are chosen separately. */
export function Heading({ level = 2, size, tone, truncate, lineClamp, className, render, ref, ...props }: HeadingProps) {
  return useRender({
    defaultTagName: `h${level}`,
    render,
    ref,
    props: mergeProps<'h2'>(props, {
      className: cn(headingVariants({ size: size ?? LEVEL_SIZE[level], tone, truncate, lineClamp }), className),
    }),
  });
}
