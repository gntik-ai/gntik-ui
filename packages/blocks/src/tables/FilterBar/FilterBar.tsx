import { ListFilter, Plus, Search } from '@gntik-ai/icons';
import {
  Button,
  cn,
  Input,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuTrigger,
  SimpleSelect,
  Token,
  useI18n,
} from '@gntik-ai/ui';
import { Fragment, useState } from 'react';
import { DEPLOYMENT_DEFAULT_FILTERS, DEPLOYMENT_FILTER_FIELDS, DEPLOYMENT_SAVED_VIEWS } from './fixtures';

export interface FilterField {
  id: string;
  label: string;
  options: readonly string[];
}

export interface ActiveFilter {
  field: string;
  value: string;
}

export interface SavedView {
  value: string;
  label: string;
  query?: string;
  filters: readonly ActiveFilter[];
}

export interface FilterBarProps {
  fields?: readonly FilterField[];
  /** Search text (controlled). */
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Active filters (controlled). */
  filters?: readonly ActiveFilter[];
  defaultFilters?: readonly ActiveFilter[];
  onFiltersChange?: (filters: ActiveFilter[]) => void;
  /** Saved views; picking one applies its query and filters. Empty hides the Select. */
  views?: readonly SavedView[];
  defaultView?: string | null;
  onViewChange?: (view: SavedView) => void;
  searchLabel?: string;
  placeholder?: string;
  /** Optional result count shown at the end ("12 results"). */
  resultCount?: number;
  className?: string;
}

const same = (a: ActiveFilter, b: ActiveFilter) => a.field === b.field && a.value === b.value;

/**
 * Filter bar: search Input, saved views Select, an "Add filter" Menu (multi-select per field),
 * removable filter chips (Token) and Clear all.
 */
export function FilterBar({
  fields = DEPLOYMENT_FILTER_FIELDS,
  query: queryProp,
  defaultQuery = '',
  onQueryChange,
  filters: filtersProp,
  defaultFilters = DEPLOYMENT_DEFAULT_FILTERS,
  onFiltersChange,
  views = DEPLOYMENT_SAVED_VIEWS,
  defaultView = null,
  onViewChange,
  searchLabel: searchLabelProp,
  placeholder = 'Search by name…',
  resultCount,
  className,
}: FilterBarProps) {
  const { t } = useI18n();
  const searchLabel = searchLabelProp ?? t('common.search');
  const [innerQuery, setInnerQuery] = useState(defaultQuery);
  const [innerFilters, setInnerFilters] = useState<readonly ActiveFilter[]>(defaultFilters);
  const [view, setView] = useState<string | null>(defaultView);
  const query = queryProp ?? innerQuery;
  const filters = filtersProp ?? innerFilters;

  const setQuery = (next: string) => {
    setInnerQuery(next);
    onQueryChange?.(next);
  };
  const setFilters = (next: ActiveFilter[], keepView = false) => {
    setInnerFilters(next);
    onFiltersChange?.(next);
    if (!keepView) setView(null);
  };
  const toggle = (filter: ActiveFilter, on: boolean) =>
    setFilters(on ? [...filters.filter((f) => !same(f, filter)), filter] : filters.filter((f) => !same(f, filter)));
  const applyView = (value: string | null) => {
    const picked = views.find((v) => v.value === value);
    if (!picked) return;
    setView(picked.value);
    setFilters([...picked.filters], true);
    if (picked.query !== undefined) setQuery(picked.query);
    onViewChange?.(picked);
  };
  const clearAll = () => {
    setFilters([]);
    setQuery('');
  };
  const labelOf = (id: string) => fields.find((f) => f.id === id)?.label ?? id;
  const hasAny = filters.length > 0 || query !== '';

  return (
    <div role="search" aria-label={t('filters.label')} className={cn('flex flex-col gap-3', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          aria-label={searchLabel}
          type="search"
          size="sm"
          leadingIcon={Search}
          placeholder={placeholder}
          value={query}
          onValueChange={(v) => setQuery(String(v))}
          className="w-full sm:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          {views.length > 0 && (
            <SimpleSelect
              aria-label={t('filters.savedView')}
              size="sm"
              placeholder={t('filters.savedViews')}
              value={view}
              onValueChange={applyView}
              items={views.map((v) => ({ value: v.value, label: v.label }))}
              className="min-w-[160px]"
            />
          )}
          <Menu>
            <MenuTrigger render={<Button variant="secondary" size="sm" icon={Plus} />}>{t('filters.add')}</MenuTrigger>
            <MenuContent className="max-h-80 min-w-[220px] overflow-y-auto">
              {fields.map((field, i) => (
                <Fragment key={field.id}>
                  {i > 0 && <MenuSeparator />}
                  <MenuGroup>
                    <MenuGroupLabel>{field.label}</MenuGroupLabel>
                    {field.options.map((option) => {
                      const filter = { field: field.id, value: option };
                      return (
                        <MenuCheckboxItem key={option} checked={filters.some((f) => same(f, filter))} onCheckedChange={(on) => toggle(filter, on)}>
                          {option}
                        </MenuCheckboxItem>
                      );
                    })}
                  </MenuGroup>
                </Fragment>
              ))}
            </MenuContent>
          </Menu>
        </div>
        {resultCount !== undefined && (
          <p className="text-[12.5px] text-muted-foreground sm:ms-auto" aria-live="polite">
            <span className="font-mono text-foreground tabular-nums">{resultCount.toLocaleString('en-US')}</span> {resultCount === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>
      {hasAny && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            <ListFilter size={12} aria-hidden />
            Filters
          </span>
          <ul aria-label={t('filters.active')} className="flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <li key={`${f.field}:${f.value}`} className="flex">
                <Token
                  size="sm"
                  prefix={`${labelOf(f.field)}:`}
                  label={f.value}
                  removeLabel={t('filters.remove', { field: labelOf(f.field), value: f.value })}
                  onRemove={() => toggle(f, false)}
                />
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="h-7 px-2 hover:text-destructive-text" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
