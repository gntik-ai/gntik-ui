import { useId, type HTMLAttributes, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { isResponsiveObject, responsiveClasses, type Responsive } from '../../utils/responsive';
import {
  sectionVariants,
  SECTION_PADDING,
  SECTION_HEADER_MARGIN,
  SECTION_BODY_GAP,
  SECTION_HEADER_PADDING,
  type SectionPadding,
  type SectionVariantProps,
} from './section.variants';

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'title'> {
  className?: string;
  ref?: Ref<HTMLElement>;
  /** `plain` (no surface), `card` (card surface + flat shadow) or `muted` (secondary well). */
  variant?: SectionVariantProps['variant'];
  /** Inner padding step, or one per breakpoint. Scalar lg grows from p-6 to sm:p-8. */
  padding?: Responsive<SectionPadding>;
  /** Draws a rule under the header and between the children. */
  divided?: boolean;
  /** Header title; also names the section landmark (aria-labelledby). */
  title?: ReactNode;
  /** Supporting line under the title. */
  description?: ReactNode;
  /** Right-hand header slot (buttons, menu). */
  actions?: ReactNode;
  /** Heading level of the title that fits the page outline. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  /** Class for the body wrapper around the children. */
  bodyClassName?: string;
}

/**
 * A painted content region (`<section>`): optional header (title, description, actions), padding and
 * dividers between its children.
 */
export function Section({
  variant,
  padding,
  divided,
  title,
  description,
  actions,
  headingLevel: Heading = 'h2',
  className,
  bodyClassName,
  children,
  ...props
}: SectionProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;
  const responsivePadding = isResponsiveObject(padding) ? padding : undefined;
  const s = sectionVariants({ variant, padding: isResponsiveObject(padding) ? 'none' : padding, divided });
  const hasHeader = title != null || description != null || actions != null;
  return (
    <section
      aria-labelledby={title != null ? titleId : undefined}
      aria-describedby={description != null ? descId : undefined}
      className={cn(s.root(), responsiveClasses(responsivePadding, SECTION_PADDING), className)}
      {...props}
    >
      {hasHeader && (
        <div
          className={cn(
            s.header(),
            responsiveClasses(responsivePadding, SECTION_HEADER_MARGIN),
            divided && responsiveClasses(responsivePadding, SECTION_HEADER_PADDING),
          )}
        >
          {title != null && (
            <Heading id={titleId} className={s.title()}>
              {title}
            </Heading>
          )}
          {description != null && (
            <p id={descId} className={s.description()}>
              {description}
            </p>
          )}
          {actions != null && <div className={s.actions()}>{actions}</div>}
        </div>
      )}
      <div className={cn(s.body(), !divided && responsiveClasses(responsivePadding, SECTION_BODY_GAP), bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
