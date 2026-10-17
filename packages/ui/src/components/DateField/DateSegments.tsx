import { cn } from '../../utils/cn';
import { parseDatePaste } from './date-parts';
import { dateFieldVariants, type DateFieldVariantProps } from './date-field.variants';
import type { DateSegmentsState } from './use-date-segments';

interface Props extends DateFieldVariantProps {
  state: DateSegmentsState;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  forceLeadingZeros?: boolean;
  prefix?: string;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function DateSegments({
  state,
  disabled,
  readOnly,
  invalid,
  forceLeadingZeros,
  prefix,
  size,
  onPrevious,
  onNext,
}: Props) {
  const s = dateFieldVariants({ size });
  return (
    <div dir="ltr" className={s.segments()}>
      {state.parts.map((part, i) => {
        if ('literal' in part)
          return (
            <span key={i} data-literal aria-hidden="true" className={cn(s.separator(), 'whitespace-pre')}>
              {part.literal}
            </span>
          );
        const key = part.key;
        const index = state.keys.indexOf(key);
        const n = state.display(key);
        const [min, max] = state.range(key);
        const text =
          n === null
            ? '––'
            : key === 'period'
              ? n
                ? state.pm
                : state.am
              : String(n).padStart(
                  forceLeadingZeros || state.draft.edited[key] || key === 'hour' || key === 'minute' || key === 'second'
                    ? key === 'year'
                      ? 4
                      : 2
                    : 1,
                  '0',
                );
        const label =
          key === 'year' || key === 'month' || key === 'day'
            ? state.t(`dateField.${key}`)
            : state.t(
                key === 'hour'
                  ? 'timePicker.hours'
                  : key === 'minute'
                    ? 'timePicker.minutes'
                    : key === 'second'
                      ? 'timePicker.seconds'
                      : 'timePicker.period',
              );
        return (
          <div
            key={key}
            ref={(el) => {
              state.segmentRefs.current[index] = el;
            }}
            role="spinbutton"
            tabIndex={disabled ? -1 : 0}
            aria-label={prefix ? `${prefix}, ${label}` : label}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={n ?? undefined}
            aria-valuetext={n === null ? state.t('timePicker.empty') : text}
            aria-disabled={disabled || undefined}
            aria-readonly={readOnly || undefined}
            aria-invalid={invalid || undefined}
            data-placeholder={n === null || undefined}
            data-segment={key}
            onPaste={(e) => {
              if (disabled || readOnly) return;
              const next = parseDatePaste(e.clipboardData.getData('text'), state.locale);
              if (next) {
                e.preventDefault();
                state.commit(next);
              }
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === 'ArrowLeft' && index === 0 && onPrevious) {
                e.preventDefault();
                onPrevious();
              } else if (e.key === 'ArrowRight' && index === state.keys.length - 1 && onNext) {
                e.preventDefault();
                onNext();
              } else state.onKeyDown(key, index)(e);
            }}
            onBlur={state.flush}
            onFocus={() => {
              state.buffer.current = null;
            }}
            className={cn(
              s.segment(),
              key === 'year' ? 'min-w-[4.2ch]' : key === 'period' ? 'min-w-[2.5ch]' : 'min-w-[2.2ch]',
            )}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
}
