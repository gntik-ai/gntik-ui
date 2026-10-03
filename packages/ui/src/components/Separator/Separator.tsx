import { Separator as BaseSeparator } from '@base-ui/react/separator';
import type { ReactNode, Ref } from 'react';
import { cn } from '../../utils/cn';
import { separatorVariants, type SeparatorVariantProps } from './separator.variants';

export interface SeparatorProps extends Omit<BaseSeparator.Props, 'className'>, SeparatorVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Text (or icon) set into a horizontal line, e.g. a date or section kicker. */
  label?: ReactNode;
  /** Where the label sits along the line. */
  labelPosition?: 'start' | 'center' | 'end';
}

/**
 * Thematic break between content (role="separator"). Horizontal or vertical; a horizontal
 * separator can carry a label. Purely decorative dividers can pass `render={<div aria-hidden />}`.
 */
export function Separator({
  orientation = 'horizontal',
  variant,
  labelStyle,
  label,
  labelPosition = 'center',
  className,
  ...props
}: SeparatorProps) {
  const s = separatorVariants({ orientation, variant, labelStyle });
  if (label == null || orientation === 'vertical') {
    return <BaseSeparator orientation={orientation} className={cn(s.line(), className)} {...props} />;
  }
  const line = s.line({ class: 'w-auto flex-1' });
  return (
    <div className={cn(s.labelled(), className)}>
      {labelPosition !== 'start' && <BaseSeparator orientation="horizontal" className={line} {...props} />}
      <span className={s.label()}>{label}</span>
      {labelPosition !== 'end' && (
        labelPosition === 'start'
          ? <BaseSeparator orientation="horizontal" className={line} {...props} />
          : <span aria-hidden className={line} />
      )}
    </div>
  );
}
