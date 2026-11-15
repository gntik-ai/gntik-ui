import { useContext } from 'react';
import { CircleAlert, CircleCheck, TriangleAlert } from 'lucide-react';
import { Spinner } from '../Spinner/Spinner';
import { FieldStatusContext } from './field-status';
import { cn } from '../../utils/cn';

/** Shared decorative feedback for the two single-line controls. */
export function useFieldFeedbackIcon(size: number, className?: string) {
  const { status, feedbackIcon } = useContext(FieldStatusContext);
  if (!feedbackIcon || status === 'idle') return null;
  const Icon =
    status === 'validating'
      ? Spinner
      : status === 'warning'
        ? TriangleAlert
        : status === 'success'
          ? CircleCheck
          : CircleAlert;
  return (
    <Icon
      size={size}
      aria-hidden
      data-field-feedback=""
      className={cn(
        'pointer-events-none shrink-0 self-center',
        status === 'warning'
          ? 'text-warning-text'
          : status === 'success'
            ? 'text-success-text'
            : status === 'error'
              ? 'text-destructive-text'
              : 'text-muted-foreground',
        className,
      )}
    />
  );
}
