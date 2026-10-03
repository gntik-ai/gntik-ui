import { Field, FieldDescription, FieldLabel, Input, Textarea, cn } from '@gntik-ai/ui';
import { useId, type HTMLAttributes, type ReactNode } from 'react';

export interface FormSectionProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'className'> {
  /** Section title shown in the left column; also names the section landmark. */
  title?: ReactNode;
  /** Help text under the title. */
  description?: ReactNode;
  /** The fields (right column). Defaults to a sample "General" field set. */
  children?: ReactNode;
  /** Footer row under the fields (e.g. Save / Cancel). */
  actions?: ReactNode;
  /** Heading level that fits the page outline. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  /** Draws a rule above the section (for stacked sections). */
  divided?: boolean;
  className?: string;
}

function SampleFields() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
      <Field className="sm:col-span-4">
        <FieldLabel>Project name</FieldLabel>
        <Input defaultValue="billing-dashboard" />
        <FieldDescription>Lowercase letters, numbers and dashes.</FieldDescription>
      </Field>
      <Field className="sm:col-span-6">
        <FieldLabel>Description</FieldLabel>
        <Textarea rows={3} defaultValue="Usage and invoice reporting for every workspace." />
      </Field>
    </div>
  );
}

/**
 * Two-column form section: title and help on the left, fields on the right. Stacks into a
 * single column on small screens.
 */
export function FormSection({
  title = 'General',
  description = 'Basic details shown to everyone who can access this project.',
  children,
  actions,
  headingLevel: Heading = 'h2',
  divided = false,
  className,
  ...props
}: FormSectionProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={title != null ? `${id}-title` : undefined}
      className={cn('grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-3', divided && 'border-t border-border pt-8', className)}
      {...props}
    >
      <div className="min-w-0">
        {title != null && (
          <Heading id={`${id}-title`} className="text-[14px] font-semibold tracking-tight text-foreground">
            {title}
          </Heading>
        )}
        {description != null && <p className="mt-1 text-[13px] leading-6 text-pretty text-muted-foreground">{description}</p>}
      </div>
      <div className="min-w-0 md:col-span-2">
        {children ?? <SampleFields />}
        {actions != null && <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">{actions}</div>}
      </div>
    </section>
  );
}
