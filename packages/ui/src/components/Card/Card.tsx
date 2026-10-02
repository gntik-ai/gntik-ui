import type { HTMLAttributes, Ref } from 'react';
import { cn } from '../../utils/cn';
import { cardVariants, type CardVariantProps } from './card.variants';

const s = cardVariants();

type DivProps = Omit<HTMLAttributes<HTMLDivElement>, 'className'> & { className?: string; ref?: Ref<HTMLDivElement> };

export interface CardProps extends DivProps {
  /** `default` (card + flat shadow), `well` (lower hierarchy, no shadow) or `outline`. */
  variant?: CardVariantProps['variant'];
}

/** Content surface: 1px border, token radius and a flat shadow. Compose with the Card* parts. */
export function Card({ variant, className, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }).root(), className)} {...props} />;
}

export interface CardHeaderProps extends DivProps {
  /** Draws a border between the header and the body. */
  divided?: boolean;
}

/** Title + description on the left, CardAction on the right. */
export function CardHeader({ divided, className, ...props }: CardHeaderProps) {
  return <div className={cn(cardVariants({ divided }).header(), className)} {...props} />;
}

export interface CardTitleProps extends Omit<HTMLAttributes<HTMLHeadingElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLHeadingElement>;
  /** Heading level that fits the page outline. */
  as?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ as: Heading = 'h3', className, ...props }: CardTitleProps) {
  return <Heading className={cn(s.title(), className)} {...props} />;
}

export interface CardDescriptionProps extends Omit<HTMLAttributes<HTMLParagraphElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLParagraphElement>;
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn(s.description(), className)} {...props} />;
}

/** Right-hand header slot (button, menu, status). */
export function CardAction({ className, ...props }: DivProps) {
  return <div className={cn(s.action(), className)} {...props} />;
}

export function CardBody({ className, ...props }: DivProps) {
  return <div className={cn(s.body(), className)} {...props} />;
}

/** Action row on a subtle well, right-aligned. */
export function CardFooter({ className, ...props }: DivProps) {
  return <div className={cn(s.footer(), className)} {...props} />;
}
