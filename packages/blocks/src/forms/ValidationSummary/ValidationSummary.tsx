import { Alert, Link, cn } from '@gntik-ai/ui';
import { useEffect, useRef, type ReactNode } from 'react';
import { validationIssues, type ValidationIssue } from './fixtures';

export type { ValidationIssue } from './fixtures';

export interface ValidationSummaryProps {
  errors?: ValidationIssue[];
  /** Increment on every submit attempt: the summary takes focus when there are errors. */
  submitCount?: number;
  /** Title; defaults to "There are N problems with this form". */
  title?: ReactNode;
  className?: string;
}

const focusField = (fieldId: string) => {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.focus();
  el.scrollIntoView?.({ block: 'center' });
};

/**
 * Error summary for long forms: lists every problem with a link that moves focus to the field.
 * After a failed submit it takes focus, so screen readers announce it.
 */
export function ValidationSummary({ errors = validationIssues, submitCount = 0, title, className }: ValidationSummaryProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hasErrors = errors.length > 0;

  useEffect(() => {
    if (submitCount > 0 && hasErrors) ref.current?.focus();
  }, [submitCount, hasErrors]);

  if (!hasErrors) return null;
  const heading = title ?? `There ${errors.length === 1 ? 'is 1 problem' : `are ${errors.length} problems`} with this form`;
  return (
    <Alert ref={ref} tabIndex={-1} role="region" tone="destructive" title={heading} className={cn('focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring', className)}>
      <ul className="mt-1 list-disc space-y-1 pl-4">
        {errors.map((e) => (
          <li key={e.fieldId}>
            <Link
              href={`#${e.fieldId}`}
              tone="inherit"
              underline="always"
              onClick={(ev) => {
                ev.preventDefault();
                focusField(e.fieldId);
              }}
            >
              {e.label ? `${e.label}: ` : ''}
              {e.message}
            </Link>
          </li>
        ))}
      </ul>
    </Alert>
  );
}
