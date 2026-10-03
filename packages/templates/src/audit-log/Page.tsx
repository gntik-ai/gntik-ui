import {
  DataTable,
  DateRangeFilter,
  FilterBar,
  NoResultsEmpty,
  PageHeader,
  type ActiveFilter,
  type DataTableColumn,
  type FilterField,
} from '@gntik-ai/blocks';
import { Download, FileDiff } from '@gntik-ai/icons';
import {
  Avatar,
  Button,
  CodeBlock,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  Page,
  StatusTag,
  Timestamp,
  type BreadcrumbItem,
  type DateRange,
} from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { auditBreadcrumbs, auditEvents, auditFilterFields, auditResultStatuses, type AuditEvent } from './data';

export interface AuditLogProps {
  /** Page heading (default "Audit log"). */
  title: string;
  /** Line under the heading. */
  description: string;
  events: AuditEvent[];
  filterFields: FilterField[];
  /** Initial date range; defaults to the last 7 days. */
  defaultRange: DateRange;
  /** Reference "today" for the date presets. */
  today: Date;
  /** Called with the filtered events; defaults to downloading them as CSV. */
  onExport: (events: AuditEvent[]) => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

const DAY = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const fieldValue = (e: AuditEvent, field: string) =>
  field === 'actor' ? e.actor.name : field === 'resource' ? e.resource : field === 'result' ? e.result : '';

/** Applies the search text, the filter chips (OR within a field, AND across fields) and the date range. */
export function filterAuditEvents(events: readonly AuditEvent[], query: string, filters: readonly ActiveFilter[], range: DateRange) {
  const q = query.trim().toLowerCase();
  const fields = [...new Set(filters.map((f) => f.field))];
  const from = range.start ? startOfDay(range.start).getTime() : -Infinity;
  const to = range.end ? startOfDay(range.end).getTime() + DAY : Infinity;
  return events.filter((e) => {
    if (q && ![e.actor.name, e.actor.email, e.action, e.target].some((v) => v.toLowerCase().includes(q))) return false;
    if (!fields.every((field) => filters.some((f) => f.field === field && f.value === fieldValue(e, field)))) return false;
    const t = e.at.getTime();
    return t >= from && t < to;
  });
}

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** CSV of the events (time, actor, action, resource, target, ip, result). */
export function auditEventsToCsv(events: readonly AuditEvent[]) {
  const head = ['time', 'actor', 'email', 'action', 'resource', 'target', 'ip', 'result'];
  const rows = events.map((e) => [e.at.toISOString(), e.actor.name, e.actor.email, e.action, e.resource, e.target, e.ip, e.result]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

function downloadCsv(events: AuditEvent[]) {
  if (typeof URL.createObjectURL !== 'function') return;
  const url = URL.createObjectURL(new Blob([auditEventsToCsv(events)], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'audit-log.csv';
  a.click();
  URL.revokeObjectURL(url);
}

/** Audit log: ConsoleShell + Page with FilterBar + DateRangeFilter, an events DataTable and a diff drawer. */
export default function AuditLogPage(props: Partial<AuditLogProps>) {
  const {
    events = auditEvents,
    filterFields = auditFilterFields,
    defaultRange,
    today,
    onExport = downloadCsv,
    breadcrumbs = auditBreadcrumbs,
    currentHref = '/activity',
    title = 'Audit log',
    description = 'Every change made in this workspace: who did it, when, from where and what changed.',
    shell,
  } = props;
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>([]);
  const [range, setRange] = useState<DateRange>(() => {
    if (defaultRange) return defaultRange;
    const t = today ?? new Date();
    return { start: new Date(t.getTime() - 6 * DAY), end: t };
  });
  const [diffEvent, setDiffEvent] = useState<AuditEvent | null>(null);

  const rows = filterAuditEvents(events, query, filters, range);

  const columns: DataTableColumn<AuditEvent>[] = [
    {
      id: 'at',
      header: 'Time',
      accessor: (e) => e.at,
      cell: (e) => <Timestamp value={e.at} format="absolute" className="font-mono text-[12px]" />,
      sortable: true,
      hideable: false,
      headClassName: 'w-44',
    },
    {
      id: 'actor',
      header: 'Actor',
      accessor: (e) => e.actor.name,
      cell: (e) => (
        <span className="flex items-center gap-2">
          <Avatar name={e.actor.name} size="xs" />
          <span className="min-w-0">
            <span className="block truncate font-medium">{e.actor.name}</span>
            <span className="block truncate text-[11.5px] text-muted-foreground">{e.actor.email}</span>
          </span>
        </span>
      ),
      sortable: true,
    },
    { id: 'action', header: 'Action', accessor: (e) => e.action, sortable: true, className: 'font-mono text-[12px]' },
    { id: 'target', header: 'Target', accessor: (e) => e.target, cell: (e) => <span className="font-medium">{e.target}</span> },
    { id: 'ip', header: 'IP address', accessor: (e) => e.ip, defaultHidden: true, className: 'font-mono text-[12px] text-muted-foreground' },
    {
      id: 'result',
      header: 'Result',
      accessor: (e) => e.result,
      cell: (e) => <StatusTag status={e.result} statuses={auditResultStatuses} />,
      sortable: true,
    },
    {
      id: 'changes',
      header: 'Changes',
      align: 'right',
      cell: (e) =>
        e.diff ? (
          <Button size="sm" variant="ghost" icon={FileDiff} aria-label={`View changes for ${e.action} on ${e.target}`} onClick={() => setDiffEvent(e)}>
            Diff
          </Button>
        ) : (
          <span className="text-[12px] text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={description}
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'Export CSV', icon: Download, variant: 'secondary', disabled: rows.length === 0, onClick: () => onExport(rows) }]}
          />
        }
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <FilterBar
            className="min-w-0 flex-1"
            fields={filterFields}
            views={[]}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            placeholder="Search actor, action or target…"
            resultCount={rows.length}
          />
          <DateRangeFilter value={range} onValueChange={setRange} today={today} label="Event date" />
        </div>
        <DataTable<AuditEvent>
          caption="Audit events"
          rows={rows}
          columns={columns}
          getRowLabel={(e) => `${e.action} on ${e.target}`}
          selectable={false}
          defaultSort={{ columnId: 'at', direction: 'descending' }}
          defaultDensity="compact"
          emptyState={
            <NoResultsEmpty entity="events" query={query} filterCount={filters.length} onClearFilters={() => setFilters([])} onClearSearch={() => setQuery('')} />
          }
        />
      </Page>
      <Drawer open={diffEvent !== null} onOpenChange={(open) => !open && setDiffEvent(null)}>
        <DrawerContent size="lg">
          {diffEvent && (
            <>
              <DrawerHeader>
                <DrawerTitle>
                  <span className="font-mono">{diffEvent.action}</span> · {diffEvent.target}
                </DrawerTitle>
                <DrawerDescription>
                  By {diffEvent.actor.name} from <span className="font-mono">{diffEvent.ip}</span> ·{' '}
                  <Timestamp value={diffEvent.at} format="absolute" />
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <CodeBlock
                  code={diffEvent.diff ?? ''}
                  language="diff"
                  filename={`${diffEvent.id}.diff`}
                  label={`Changes for ${diffEvent.action}`}
                  highlightLines={(diffEvent.diff ?? '').split('\n').flatMap((l, i) => (l.startsWith('+') ? [i + 1] : []))}
                />
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </ConsoleShell>
  );
}
