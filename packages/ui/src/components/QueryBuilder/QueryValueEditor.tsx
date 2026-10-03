import { useI18n } from '../../i18n/I18nProvider';
import { toISODate } from '../Calendar/calendar-utils';
import { DatePicker } from '../DatePicker';
import { Input } from '../Input';
import { MultiSelect } from '../MultiSelect';
import { NumberInput } from '../NumberInput';
import { SimpleSelect } from '../Select';
import { operatorArity, type QueryCondition, type QueryField, type QueryValue } from './query';
import { queryBuilderVariants } from './query-builder.variants';

export interface QueryValueEditorProps {
  condition: QueryCondition;
  field: QueryField | undefined;
  onChange: (value: QueryValue | undefined) => void;
  disabled?: boolean;
  locale?: string;
}

const s = queryBuilderVariants();

const fromISO = (v: unknown): Date | null => {
  if (typeof v !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
};
const asNumber = (v: unknown): number | null => (typeof v === 'number' && !Number.isNaN(v) ? v : null);

/** The value control for a condition: depends on the field type and the operator's arity. */
export function QueryValueEditor({ condition, field, onChange, disabled, locale }: QueryValueEditorProps) {
  const { t } = useI18n();
  const arity = operatorArity(condition.operator);
  if (!field || arity === 'none') return null;
  const v = condition.value;
  const pair = Array.isArray(v) && arity === 'pair' ? v : [null, null];

  if (field.type === 'enum') {
    const options = field.options ?? [];
    if (arity === 'list') {
      return (
        <MultiSelect
          aria-label={t('queryBuilder.value')}
          options={options}
          value={Array.isArray(v) ? (v as unknown[]).map(String) : []}
          onValueChange={(vals) => onChange(vals)}
          disabled={disabled}
          size="sm"
          className={s.valueControl()}
        />
      );
    }
    return (
      <SimpleSelect
        aria-label={t('queryBuilder.value')}
        items={options}
        value={typeof v === 'string' ? v : null}
        onValueChange={(val) => onChange(val ?? undefined)}
        disabled={disabled}
        size="sm"
        className={s.valueControl()}
      />
    );
  }

  if (field.type === 'number') {
    if (arity === 'pair') {
      const set = (i: 0 | 1, n: number | null) => {
        const next: [number | null, number | null] = [asNumber(pair[0]), asNumber(pair[1])];
        next[i] = n;
        onChange(next[0] === null && next[1] === null ? undefined : next);
      };
      return (
        <>
          <NumberInput aria-label={t('queryBuilder.valueFrom')} value={asNumber(pair[0])} onValueChange={(n) => set(0, n)} disabled={disabled} size="sm" hideSteppers className="w-28" />
          <NumberInput aria-label={t('queryBuilder.valueTo')} value={asNumber(pair[1])} onValueChange={(n) => set(1, n)} disabled={disabled} size="sm" hideSteppers className="w-28" />
        </>
      );
    }
    return (
      <NumberInput
        aria-label={t('queryBuilder.value')}
        value={asNumber(v)}
        onValueChange={(n) => onChange(n ?? undefined)}
        disabled={disabled}
        size="sm"
        hideSteppers
        className="w-36"
      />
    );
  }

  if (field.type === 'date') {
    if (arity === 'pair') {
      const set = (i: 0 | 1, d: Date | null) => {
        const next: [string, string] = [typeof pair[0] === 'string' ? pair[0] : '', typeof pair[1] === 'string' ? pair[1] : ''];
        next[i] = d ? toISODate(d) : '';
        onChange(next[0] || next[1] ? next : undefined);
      };
      return (
        <>
          <DatePicker aria-label={t('queryBuilder.valueFrom')} value={fromISO(pair[0])} onValueChange={(d) => set(0, d)} locale={locale} disabled={disabled} size="sm" className="w-44" />
          <DatePicker aria-label={t('queryBuilder.valueTo')} value={fromISO(pair[1])} onValueChange={(d) => set(1, d)} locale={locale} disabled={disabled} size="sm" className="w-44" />
        </>
      );
    }
    return (
      <DatePicker
        aria-label={t('queryBuilder.value')}
        value={fromISO(v)}
        onValueChange={(d) => onChange(d ? toISODate(d) : undefined)}
        locale={locale}
        disabled={disabled}
        size="sm"
        className="w-44"
      />
    );
  }

  return (
    <Input
      aria-label={t('queryBuilder.value')}
      value={typeof v === 'string' ? v : v === undefined || v === null ? '' : String(v)}
      onChange={(e) => onChange(e.currentTarget.value === '' ? undefined : e.currentTarget.value)}
      disabled={disabled}
      size="sm"
      className={s.valueControl()}
    />
  );
}
