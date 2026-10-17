import { useI18n } from '../../i18n/I18nProvider';
import { useSegments } from '../TimePicker/segments';
import { dayPeriodLabels, localeHourCycle } from '../TimePicker/time-utils';
import type { DateFieldProps } from './DateField';
import {
  dateComplete,
  displaySegment,
  draftDate,
  fieldParts,
  segmentRange,
  toDateDraft,
  withDateSegment,
} from './date-parts';

/** Date-specific policy around the generic segment engine. Values compare by local timestamp. */
export function useDateSegments(props: DateFieldProps) {
  const { locale: providerLocale, t } = useI18n();
  const locale = props.locale ?? providerLocale;
  const granularity = props.granularity ?? 'day';
  const hourCycle = props.hourCycle ?? localeHourCycle(locale);
  const [am, pm] = dayPeriodLabels(locale);
  const parts = fieldParts(locale, granularity, hourCycle);
  const keys = parts.flatMap((part) => ('key' in part ? [part.key] : []));
  const engine = useSegments({
    value: props.value === undefined ? undefined : (props.value?.getTime() ?? null),
    defaultValue: props.defaultValue?.getTime() ?? null,
    onValueChange: (next) => props.onValueChange?.(next === null ? null : new Date(next)),
    toDraft: (next: number | null) => toDateDraft(next === null ? null : new Date(next)),
    toValue: (draft) => draftDate(draft, granularity)?.getTime() ?? null,
    keys,
    display: (draft, key) => displaySegment(draft, key, hourCycle),
    range: (key, draft) => segmentRange(key, draft, hourCycle),
    typingRange: (key, draft) => (key === 'day' ? [1, 31] : segmentRange(key, draft, hourCycle)),
    withSegment: (draft, key, n) => withDateSegment(draft, key, n, hourCycle),
    notifyDraft: (draft) => dateComplete(draft, granularity) && draftDate(draft, granularity) === null,
    resetOnExternalChange: true,
    digitCount: (key) => (key === 'year' ? 4 : 2),
    deferDigits: (key) => key === 'year',
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
  const current = engine.current === null ? null : new Date(engine.current);
  const invalid =
    props.invalid ||
    (dateComplete(engine.draft) && !draftDate(engine.draft)) ||
    (!!current &&
      ((!!props.min && current < props.min) ||
        (!!props.max && current > props.max) ||
        !!props.isDateDisabled?.(current)));
  return { ...engine, currentDate: current, invalid, parts, keys, locale, granularity, t, am, pm };
}
export type DateSegmentsState = ReturnType<typeof useDateSegments>;
