import {
  ChartCard,
  DataTable,
  DateRangeFilter,
  FilterBar,
  NoResultsEmpty,
  PageHeader,
  type ActiveFilter,
  type ChartCardRange,
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

export interface UsageAnalyticsProps {
  title: string;
  description: string;
  breadcrumbs: BreadcrumbItem[];
  rows: readonly UsageRow[];
  savedViews: readonly SavedView[];
  trafficByRange: Readonly<Record<string, readonly TrafficPoint[]>>;
  trafficRanges: readonly ChartCardRange[];
  /** Fires when the date range changes (server-side products refetch here). */
  onRangeChange: (range: DateRange) => void;
  onExport: (request: UsageExportRequest) => void;
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Usage analytics: date range + filters, two charts and a sortable breakdown table with export. */
export default function UsageAnalyticsPage({
  title = 'Usage analytics',
  description = 'Traffic, errors and spend by project and environment.',
  breadcrumbs = usageBreadcrumbs,
  rows = usageRows,
  savedViews = usageSavedViews,
  trafficByRange: traffic = trafficByRange,
  trafficRanges: ranges = trafficRanges,
  onRangeChange,
  onExport,
  shell,
}: Partial<UsageAnalyticsProps>) {
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
              fields={usageFilterFields}
              query={query}
              onQueryChange={setQuery}
              filters={filters}
              onFiltersChange={setFilters}
              defaultFilters={[]}
              views={savedViews}
              placeholder="Search projects…"
              resultCount={visible.length}
            />
          </HStack>
          <Section title="Trends" description="Spend and traffic over the selected range.">
            <Grid cols={{ base: 1, lg: 2 }} gap={6}>
              <ChartCard />
              <ChartCard<TrafficPoint>
                title="Requests by environment"
                description="Daily requests"
                ranges={ranges}
                dataByRange={traffic}
                index="day"
                categories={['Production', 'Staging', 'Preview']}
                kind="bar"
                valueFormatter={chartFmt.compact}
              />
            </Grid>
          </Section>
          <Section title="Breakdown" description="Per project and environment. Sort by any column.">
            <DataTable<UsageRow>
              rows={visible}
              columns={usageColumns}
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
