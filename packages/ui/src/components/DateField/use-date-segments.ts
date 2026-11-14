import { useI18n } from '../../i18n/I18nProvider';
import { useSegments } from '../TimePicker/segments';
import { dayPeriodLabels, localeHourCycle } from '../TimePicker/time-utils';
import type { DateFieldProps } from './DateField';
import {
  compareFieldDates,
  dateComplete,
  displaySegment,
  draftDate,
  draftFill,
  fieldParts,
  fieldZone,
  segmentRange,
  toDateDraft,
  withDateSegment,
  type DateDraft,
} from './date-parts';

/** Internal inputs of the segment engine beyond the public props. */
export interface DateSegmentsOptions extends Omit<DateFieldProps, 'onValueChange'> {
  /** `isDateDisabled` context: the pending start of a range whose end this field holds. */
  rangeStart?: Date | null;
  /** Typing past the last segment moves on to the next field. */
  onAdvance?: () => void;
  onValueChange?: (date: Date | null, draft: DateDraft) => void;
  /** Every applied edit, whether or not it changed the date. */
  onCommit?: (date: Date | null, draft: DateDraft) => void;
}

/** Date-specific policy around the generic segment engine, including granularity-aware bounds. */
export function useDateSegments(props: DateSegmentsOptions) {
  const { locale: providerLocale, t } = useI18n();
  const locale = props.locale ?? providerLocale;
  const granularity = props.granularity ?? 'day';
  const hourCycle = props.hourCycle ?? localeHourCycle(locale);
  const zone = fieldZone(props.timeZone, props.utc);
  const [am, pm] = dayPeriodLabels(locale);
  const parts = fieldParts(locale, granularity, hourCycle);
  const keys = parts.flatMap((part) => ('key' in part ? [part.key] : []));
  const engine = useSegments({
    value: props.value === undefined ? undefined : (props.value?.getTime() ?? null),
    defaultValue: props.defaultValue?.getTime() ?? null,
    onValueChange: (next, draft) => props.onValueChange?.(next === null ? null : new Date(next), draft),
    onCommit: (draft, next) => props.onCommit?.(next === null ? null : new Date(next), draft),
    toDraft: (next: number | null) => toDateDraft(next === null ? null : new Date(next), zone),
    toValue: (draft) => draftDate(draft, granularity, hourCycle, zone)?.getTime() ?? null,
    keys,
    display: (draft, key) => displaySegment(draft, key, hourCycle),
    range: (key, draft) => segmentRange(key, draft, hourCycle),
    typingRange: (key, draft) => (key === 'day' ? [1, 31] : segmentRange(key, draft, hourCycle)),
    withSegment: (draft, key, n) => withDateSegment(draft, key, n, hourCycle),
    notifyDraft: (draft) =>
      dateComplete(draft, granularity, hourCycle) && draftDate(draft, granularity, hourCycle, zone) === null,
    resetOnExternalChange: true,
    digitCount: (key) => (key === 'year' ? 4 : 2),
    // A typed segment is reported once it is finished (full, or left), never at its first digit.
    deferDigits: () => true,
    numeric: (key) => key !== 'period',
    character: (_key, character) => {
      const c = character.toLowerCase();
      if (c === 'a' || am.toLowerCase().startsWith(c)) return 0;
      if (c === 'p' || pm.toLowerCase().startsWith(c)) return 1;
      return undefined;
    },
    onAdvance: props.onAdvance,
    disabled: props.disabled,
    readOnly: props.readOnly,
  });
  const current = engine.committed === null ? null : new Date(engine.committed);
  const invalid =
    props.invalid ||
    (dateComplete(engine.committedDraft) && !draftDate(engine.committedDraft, 'day', 24, zone)) ||
    (!!current &&
      ((!!props.min && compareFieldDates(current, props.min, granularity, zone) < 0) ||
        (!!props.max && compareFieldDates(current, props.max, granularity, zone) > 0) ||
        !!props.isDateDisabled?.(current, { rangeStart: props.rangeStart ?? null })));
  const fill = draftFill(engine.committedDraft, granularity, hourCycle);
  return {
    ...engine,
    currentDate: current,
    invalid,
    parts,
    keys,
    locale,
    granularity,
    hourCycle,
    zone,
    fill,
    t,
    am,
    pm,
  };
}
export type DateSegmentsState = ReturnType<typeof useDateSegments>;
