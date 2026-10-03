import {
  ChartCard,
  DataTable,
  DateRangeFilter,
  FilterBar,
  NoResultsEmpty,
  PageHeader,
  type ActiveFilter,
  type ChartCardProps,
  type ChartCardRange,
  type CostPoint,
  type DataTableColumn,
  type FilterField,
  type SavedView,
} from '@gntik-ai/blocks';
import { chartFmt } from '@gntik-ai/charts';
import { Download } from '@gntik-ai/icons';
import { Grid, HStack, Page, Section, Stack, type BreadcrumbItem, type DateRange } from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  filterUsage,
  trafficByRange,
  trafficRanges,
  usageBreadcrumbs,
  usageColumns,
  usageFilterFields,
  usageRows,
  usageSavedViews,
  type TrafficPoint,
  type UsageRow,
} from './data';

export interface UsageExportRequest {
  range: DateRange | null;
  query: string;
  filters: ActiveFilter[];
  /** Rows currently shown in the breakdown. */
  rows: UsageRow[];
}

/** Second-chart settings (everything but its data and ranges, which have their own props). */
export type UsageSecondaryChart<T extends object> = Omit<ChartCardProps<T>, 'dataByRange' | 'ranges'>;

/**
 * `P` is the row type of the first chart (default: the infrastructure-cost fixture), `T` the row
 * type of the second one (default: requests per environment and day).
 */
export interface UsageAnalyticsProps<P extends object = CostPoint, T extends object = TrafficPoint> {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  rows: readonly UsageRow[];
  /** Breakdown table columns (default: project, environment, region, requests, error rate, cost). */
  columns: DataTableColumn<UsageRow>[];
  /** FilterBar fields; each id is matched against the row field of the same name. */
  filterFields: FilterField[];
  searchPlaceholder: string;
  savedViews: readonly SavedView[];
  /**
   * First chart: any ChartCard props (title, description, ranges, dataByRange, index, categories,
   * colors, kind, valueFormatter…). Unset fields keep the infrastructure-cost fixture.
   */
  primaryChart: ChartCardProps<P>;
  /** Data of the second chart, per range key. */
  trafficByRange: Readonly<Record<string, readonly T[]>>;
  trafficRanges: readonly ChartCardRange[];
  /** Second chart: title, description, index, categories, colors, kind… (merged over the traffic defaults). */
  secondaryChart: UsageSecondaryChart<T>;
  /** Fires when the date range changes (server-side products refetch here). */
  onRangeChange: (range: DateRange) => void;
  onExport: (request: UsageExportRequest) => void;
  shell: Omit<ConsoleShellProps, 'children'>;
}

const TRAFFIC_CHART: UsageSecondaryChart<TrafficPoint> = {
  title: 'Requests by environment',
  description: 'Daily requests',
  index: 'day',
  categories: ['Production', 'Staging', 'Preview'],
  kind: 'bar',
  valueFormatter: chartFmt.compact,
};

/** Usage analytics: date range + filters, two charts and a sortable breakdown table with export. */
export default function UsageAnalyticsPage<P extends object = CostPoint, T extends object = TrafficPoint>({
  title = 'Usage analytics',
  description = 'Traffic, errors and spend by project and environment.',
  breadcrumbs = usageBreadcrumbs,
  rows = usageRows,
  columns = usageColumns,
  filterFields = usageFilterFields,
  searchPlaceholder = 'Search projects…',
  savedViews = usageSavedViews,
  primaryChart,
  trafficByRange: traffic = trafficByRange as unknown as Readonly<Record<string, readonly T[]>>,
  trafficRanges: ranges = trafficRanges,
  secondaryChart,
  onRangeChange,
  onExport,
  shell,
}: Partial<UsageAnalyticsProps<P, T>>) {
  const secondary = { ...(TRAFFIC_CHART as unknown as UsageSecondaryChart<T>), ...secondaryChart };
  const [range, setRange] = useState<DateRange | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const visible = filterUsage(rows, query, filters);

  const clearFilters = () => setFilters([]);
  const exportAction = {
    label: 'Export CSV',
    icon: Download,
    variant: 'secondary' as const,
    onClick: () => onExport?.({ range, query, filters, rows: visible }),
  };

  return (
    <ConsoleShell currentHref="/analytics" breadcrumbs={breadcrumbs} {...shell}>
      <Page
        width="wide"
        header={<PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} tabs={null} actions={[exportAction]} />}
      >
        <Stack gap={6}>
          <HStack align="start" gap={3} wrap>
            <DateRangeFilter
              onValueChange={(next) => {
                setRange(next);
                onRangeChange?.(next);
              }}
            />
            <FilterBar
              className="min-w-0 flex-1"
              fields={filterFields}
              query={query}
              onQueryChange={setQuery}
              filters={filters}
              onFiltersChange={setFilters}
              defaultFilters={[]}
              views={savedViews}
              placeholder={searchPlaceholder}
              resultCount={visible.length}
            />
          </HStack>
          <Grid cols={{ base: 1, lg: 2 }} gap={6}>
            <ChartCard<P> titleAs="h2" {...primaryChart} />
            <ChartCard<T> titleAs="h2" {...secondary} ranges={ranges} dataByRange={traffic} />
          </Grid>
          <Section title="Breakdown" description="Per project and environment. Sort by any column.">
            <DataTable<UsageRow>
              rows={visible}
              columns={columns}
              getRowLabel={(r) => `${r.project} (${r.environment})`}
              caption="Usage by project"
              selectable={false}
              showDensityToggle
              showColumnMenu
              defaultSort={{ columnId: 'cost', direction: 'descending' }}
              emptyState={
                <NoResultsEmpty
                  entity="projects"
                  query={query}
                  filterCount={filters.length}
                  onClearFilters={clearFilters}
                  onClearSearch={() => setQuery('')}
                  titleAs="h3"
                />
              }
            />
          </Section>
        </Stack>
      </Page>
    </ConsoleShell>
  );
}
