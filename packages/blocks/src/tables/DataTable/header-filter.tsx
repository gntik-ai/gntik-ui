import { Filter } from '@gntik-ai/icons';
import {
  Button,
  Checkbox,
  Input,
  NumberInput,
  Radio,
  RadioGroup,
  DateRangePicker,
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
  useI18n,
  type QueryCondition,
} from '@gntik-ai/ui';
import { useState } from 'react';
import type { DataTableColumnFilter, DataTableFilterValue } from './data-table-utils';
import type { DataTableLabels } from './labels';

export function HeaderFilter({
  header,
  filter,
  condition,
  onApply,
  labels,
}: {
  header: string;
  filter: DataTableColumnFilter;
  condition?: QueryCondition;
  onApply: (value: DataTableFilterValue | null) => void;
  labels?: Partial<DataTableLabels>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DataTableFilterValue | null>(null);
  const [search, setSearch] = useState('');
  const name = labels?.filterColumn?.(header) ?? t('table.filterColumn', { header });
  const apply = (value = draft) => {
    onApply(value);
    setOpen(false);
  };
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setDraft(condition ?? null);
          setSearch('');
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={name + (condition ? (labels?.filtered ?? t('table.filtered')) : '')}
          />
        }
      >
        <Filter size={14} aria-hidden className={condition ? 'text-primary-text' : 'text-muted-foreground'} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        <PopoverTitle>{name}</PopoverTitle>
        <form
          className="mt-3 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.defaultPrevented &&
              !(event.target instanceof HTMLElement && event.target.closest('button:not([role="checkbox"])'))
            ) {
              event.preventDefault();
              apply();
            }
          }}
        >
          {filter.type === 'enum' && (
            <>
              {(filter.searchable || filter.options.length > 8) && (
                <Input
                  aria-label={labels?.filterSearch ?? t('common.search')}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              )}
              <div className="max-h-60 space-y-2 overflow-auto">
                {filter.options
                  .filter((option) => option.label.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
                  .map((option) => {
                    const values = Array.isArray(draft?.value) ? draft.value.map(String) : [];
                    return (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={values.includes(option.value)}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...values, option.value]
                            : values.filter((value) => value !== option.value);
                          setDraft(next.length ? { operator: 'in', value: next } : null);
                        }}
                      />
                    );
                  })}
              </div>
            </>
          )}
          {filter.type === 'text' && (
            <Input
              aria-label={header}
              value={typeof draft?.value === 'string' ? draft.value : ''}
              onChange={(event) =>
                setDraft(event.target.value ? { operator: 'contains', value: event.target.value } : null)
              }
            />
          )}
          {filter.type === 'number' &&
            (() => {
              const min =
                draft?.operator === 'gte'
                  ? Number(draft.value)
                  : draft?.operator === 'between' && Array.isArray(draft.value)
                    ? Number(draft.value[0])
                    : null;
              const max =
                draft?.operator === 'lte'
                  ? Number(draft.value)
                  : draft?.operator === 'between' && Array.isArray(draft.value)
                    ? Number(draft.value[1])
                    : null;
              const limits = (from: number | null, to: number | null) =>
                setDraft(
                  from !== null && to !== null
                    ? { operator: 'between', value: [from, to] }
                    : from !== null
                      ? { operator: 'gte', value: from }
                      : to !== null
                        ? { operator: 'lte', value: to }
                        : null,
                );
              return (
                <div className="space-y-2">
                  <NumberInput
                    hideSteppers
                    aria-label={labels?.filterFrom ?? t('queryBuilder.valueFrom')}
                    value={min}
                    onValueChange={(value) => limits(value, max)}
                  />
                  <NumberInput
                    hideSteppers
                    aria-label={labels?.filterTo ?? t('queryBuilder.valueTo')}
                    value={max}
                    onValueChange={(value) => limits(min, value)}
                  />
                </div>
              );
            })()}
          {filter.type === 'date' &&
            (() => {
              const pair = Array.isArray(draft?.value) ? draft.value : [];
              const date = (value: unknown) =>
                typeof value === 'string' && value ? new Date(`${value}T00:00:00`) : null;
              const iso = (value: Date) =>
                `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
              return (
                <DateRangePicker
                  aria-label={header}
                  presets={[]}
                  value={{ start: date(pair[0]), end: date(pair[1]) }}
                  onValueChange={({ start, end }) =>
                    setDraft(start && end ? { operator: 'between', value: [iso(start), iso(end)] } : null)
                  }
                />
              );
            })()}
          {filter.type === 'boolean' && (
            <RadioGroup
              aria-label={header}
              value={draft?.operator ?? 'any'}
              onKeyDown={(event) => {
                // Radio consumes Enter to prevent activation; here it applies the selected draft.
                if (event.key === 'Enter') {
                  event.preventDefault();
                  apply();
                }
              }}
              onValueChange={(value) =>
                setDraft(value === 'isTrue' || value === 'isFalse' ? { operator: value } : null)
              }
            >
              <Radio value="any" label={labels?.filterAny ?? t('table.filterAny')} />
              <Radio value="isTrue" label={labels?.booleanTrue ?? t('common.yes')} />
              <Radio value="isFalse" label={labels?.booleanFalse ?? t('common.no')} />
            </RadioGroup>
          )}
          {filter.type === 'custom' &&
            filter.render({ value: draft, setValue: setDraft, apply: () => apply(), clear: () => apply(null) })}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => apply(null)}>
              {labels?.clearFilter ?? t('common.clear')}
            </Button>
            <Button type="submit" size="sm">
              {labels?.applyFilter ?? t('table.applyFilter')}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
