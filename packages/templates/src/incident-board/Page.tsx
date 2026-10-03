import { FilterBar, KpiRow, PageHeader, type ActiveFilter, type FilterField } from '@gntik-ai/blocks';
import { Download, Plus } from '@gntik-ai/icons';
import {
  Avatar,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  HStack,
  KanbanBoard,
  LiveAnnouncer,
  Page,
  SimpleSelect,
  Stack,
  StatusTag,
  Text,
  Timestamp,
  useAnnounce,
  type BreadcrumbItem,
  type KanbanColumn,
  type KanbanMove,
} from '@gntik-ai/ui';
import { useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  applyVisibleMove,
  formatAge,
  matchesTriage,
  triageBreadcrumbs,
  triageColumns,
  triageFilterFields,
  triageKpis,
  triageNow,
  triageSeverities,
  type TriageIncident,
} from './data';

export interface IncidentBoardProps {
  title: string;
  description: string;
  /** Initial columns (stages) and incident cards. */
  defaultColumns: KanbanColumn<TriageIncident>[];
  filterFields: FilterField[];
  defaultFilters: ActiveFilter[];
  /** Clock for the card ages (epoch ms). */
  now: number;
  /** Fires after a card moves (drag, keyboard or the drawer's status select), in full-board indices. */
  onMove: (move: KanbanMove, columns: KanbanColumn<TriageIncident>[]) => void;
  /** Initially open incident (details drawer). */
  defaultOpenId: string | null;
  onDeclare: () => void;
  onExport: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  shell: Omit<ConsoleShellProps, 'children'>;
}

type Handlers = 'onMove' | 'onDeclare' | 'onExport';
type BoardProps = Omit<IncidentBoardProps, 'breadcrumbs' | 'currentHref' | 'shell' | Handlers> & Partial<Pick<IncidentBoardProps, Handlers>>;

function IncidentCard({ incident, now }: { incident: TriageIncident; now: number }) {
  return (
    <span className="grid gap-2">
      <span className="text-[13px] leading-5 font-medium text-foreground">{incident.title}</span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <StatusTag status={incident.severity} statuses={triageSeverities} size="sm" />
        <span className="font-mono text-[11px] text-muted-foreground">{incident.id}</span>
      </span>
      <span className="flex items-center justify-between gap-2 text-[12px] text-muted-foreground">
        <span className="flex min-w-0 items-center gap-1.5">
          <Avatar size="xs" name={incident.owner} aria-hidden />
          <span className="truncate">{incident.owner}</span>
        </span>
        <span className="font-mono tabular-nums">
          <span className="sr-only">Age </span>
          {formatAge(incident.openedAt, now)}
        </span>
      </span>
    </span>
  );
}

function IncidentBoard({ title, description, defaultColumns, filterFields, defaultFilters, now, onMove, defaultOpenId, onDeclare, onExport }: BoardProps) {
  const announce = useAnnounce();
  const [columns, setColumns] = useState(defaultColumns);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<ActiveFilter[]>(defaultFilters);
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);

  const visible = columns.map((c) => ({ ...c, cards: c.cards.filter((i) => matchesTriage(i, query, filters)) }));
  const shown = visible.reduce((n, c) => n + c.cards.length, 0);
  const openColumn = columns.find((c) => c.cards.some((i) => i.id === openId));
  const open = openColumn?.cards.find((i) => i.id === openId);

  const commit = (next: KanbanColumn<TriageIncident>[], move: KanbanMove) => {
    setColumns(next);
    onMove?.(move, next);
  };

  const moveFromDrawer = (incident: TriageIncident, toColumnId: string) => {
    const from = columns.find((c) => c.cards.some((i) => i.id === incident.id));
    const to = columns.find((c) => c.id === toColumnId);
    if (!from || !to || from.id === to.id) return;
    const result = applyVisibleMove(columns, columns, {
      cardId: incident.id,
      fromColumnId: from.id,
      fromIndex: from.cards.findIndex((i) => i.id === incident.id),
      toColumnId: to.id,
      toIndex: to.cards.length,
    });
    commit(result.columns, result.move);
    announce(`${incident.title} moved to ${to.title}.`);
  };

  return (
    <>
      <Page
        width="full"
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={description}
            status=""
            meta={[]}
            tabs={null}
            actions={[
              { label: 'Export', icon: Download, variant: 'secondary', onClick: onExport },
              { label: 'Declare incident', icon: Plus, variant: 'primary', onClick: onDeclare },
            ]}
          />
        }
      >
        <Stack gap={5}>
          <KpiRow items={triageKpis(columns)} variant="strip" showTrends={false} label="Incident summary" />
          <FilterBar
            fields={filterFields}
            views={[]}
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            placeholder="Search id, title, service or owner…"
            resultCount={shown}
          />
          <KanbanBoard<TriageIncident>
            label="Incidents by stage"
            headingLevel={2}
            emptyText="No incidents"
            columns={visible}
            onMove={(move) => {
              const result = applyVisibleMove(columns, visible, move);
              commit(result.columns, result.move);
            }}
            getCardLabel={(i) => `${i.id} ${i.title}, ${triageSeverities[i.severity].label}`}
            onCardOpen={(i) => setOpenId(i.id)}
            renderCard={(i) => <IncidentCard incident={i} now={now} />}
          />
        </Stack>
      </Page>
      <Drawer open={open != null} onOpenChange={(next) => !next && setOpenId(null)}>
        <DrawerContent size="md">
          {open && openColumn && (
            <>
              <DrawerHeader>
                <DrawerTitle>{open.title}</DrawerTitle>
                <DrawerDescription>
                  {open.id} · {open.service}
                </DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <Stack gap={5}>
                  <HStack gap={2} wrap>
                    <StatusTag status={open.severity} statuses={triageSeverities} />
                    <Text as="span" variant="caption" tone="muted">
                      Open for {formatAge(open.openedAt, now)}
                    </Text>
                  </HStack>
                  <Text variant="supporting">{open.summary}</Text>
                  <dl className="grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-3 text-[13px]">
                    <dt className="text-muted-foreground">Stage</dt>
                    <dd>
                      <SimpleSelect
                        aria-label="Stage"
                        size="sm"
                        items={columns.map((c) => ({ value: c.id, label: c.title }))}
                        value={openColumn.id}
                        onValueChange={(v) => v && moveFromDrawer(open, v)}
                        className="w-44"
                      />
                    </dd>
                    <dt className="text-muted-foreground">Owner</dt>
                    <dd className="flex items-center gap-2 text-foreground">
                      <Avatar size="xs" name={open.owner} aria-hidden />
                      {open.owner}
                    </dd>
                    <dt className="text-muted-foreground">Service</dt>
                    <dd className="font-mono text-foreground">{open.service}</dd>
                    <dt className="text-muted-foreground">Declared</dt>
                    <dd className="text-foreground">
                      <Timestamp value={open.openedAt} format="absolute" tooltip={false} />
                    </dd>
                  </dl>
                </Stack>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

/** Incident triage board: KPI summary, FilterBar and a KanbanBoard by stage with keyboard moves and a details Drawer. */
export default function IncidentBoardPage(props: Partial<IncidentBoardProps>) {
  const {
    title = 'Incident board',
    description = 'Triage incidents by stage. Drag a card, or focus it and press Space to pick it up; Enter opens the details.',
    defaultColumns = triageColumns,
    filterFields = triageFilterFields,
    defaultFilters = [],
    now = triageNow,
    onMove,
    defaultOpenId = null,
    onDeclare,
    onExport,
    breadcrumbs = triageBreadcrumbs,
    currentHref = '/incidents',
    shell,
  } = props;
  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <LiveAnnouncer>
        <IncidentBoard
          title={title}
          description={description}
          defaultColumns={defaultColumns}
          filterFields={filterFields}
          defaultFilters={defaultFilters}
          now={now}
          onMove={onMove}
          defaultOpenId={defaultOpenId}
          onDeclare={onDeclare}
          onExport={onExport}
        />
      </LiveAnnouncer>
    </ConsoleShell>
  );
}
