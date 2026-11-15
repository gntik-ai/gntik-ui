import { useContext } from 'react';
import { DateFieldZoneContext } from './date-field-zone-context';
import { useI18n } from '../../i18n/I18nProvider';
import { useSegments } from '../TimePicker/segments';
import { dayPeriodLabels, localeHourCycle } from '../TimePicker/time-utils';
import type { DateFieldProps } from './DateField';
import {
  compareFieldDates,
  dateComplete,
  displaySegment,
  draftDate,
  fieldParts,
  segmentRange,
  toDateDraft,
  withDateSegment,
  type DateDraft,
} from './date-parts';

/** Date-specific policy around the generic segment engine, including granularity-aware bounds. */
export function useDateSegments(props: DateFieldProps, onDraftChange?: (draft: DateDraft, value: Date | null) => void) {
  const { locale: providerLocale, t } = useI18n();
  const locale = props.locale ?? providerLocale;
  const granularity = props.granularity ?? 'day';
  const hourCycle = props.hourCycle ?? localeHourCycle(locale);
  const [am, pm] = dayPeriodLabels(locale);
  const parts = fieldParts(locale, granularity, hourCycle);
  const keys = parts.flatMap((part) => ('key' in part ? [part.key] : []));
  const zone = useContext(DateFieldZoneContext);
  const engine = useSegments({
    draftKey: `${zone}:${props.utc === true}`,
    value: props.value === undefined ? undefined : (props.value?.getTime() ?? null),
    defaultValue: props.defaultValue?.getTime() ?? null,
    onValueChange: (next) => props.onValueChange?.(next === null ? null : new Date(next)),
    toDraft: (next: number | null) => toDateDraft(next === null ? null : new Date(next), props.utc),
    toValue: (draft) =>
      granularity !== 'day' && hourCycle === 12 && draft.pm === null
        ? null
        : (draftDate(draft, granularity, props.utc)?.getTime() ?? null),
    keys,
    display: (draft, key) => displaySegment(draft, key, hourCycle),
    range: (key, draft) => segmentRange(key, draft, hourCycle),
    typingRange: (key, draft) => (key === 'day' ? [1, 31] : segmentRange(key, draft, hourCycle)),
    withSegment: (draft, key, n) => withDateSegment(draft, key, n, hourCycle),
    notifyDraft: (draft) => dateComplete(draft, granularity) && draftDate(draft, granularity, props.utc) === null,
    onDraftChange: (draft, value) => onDraftChange?.(draft, value === null ? null : new Date(value)),
    resetOnExternalChange: true,
    digitCount: (key) => (key === 'year' ? 4 : 2),
    deferDigits: (key) => key !== 'period',
    numeric: (key) => key !== 'period',
    character: (_key, character) => {
      const c = character.toLowerCase();
      if (c === 'a' || am.toLowerCase().startsWith(c)) return 0;
      if (c === 'p' || pm.toLowerCase().startsWith(c)) return 1;
      return undefined;
    },
    disabled: props.disabled,
    readOnly: props.readOnly,
  });
  const current = engine.committed === null ? null : new Date(engine.committed);
  const invalid =
    props.invalid ||
    (dateComplete(engine.committedDraft, granularity) && !draftDate(engine.committedDraft, granularity, props.utc)) ||
    (!!current &&
      ((!!props.min && compareFieldDates(current, props.min, granularity, props.utc) < 0) ||
        (!!props.max && compareFieldDates(current, props.max, granularity, props.utc) > 0) ||
        !!props.isDateDisabled?.(current)));
  return { ...engine, currentDate: current, invalid, parts, keys, locale, granularity, t, am, pm };
}
export type DateSegmentsState = ReturnType<typeof useDateSegments>;
