import { PageHeader, StatusTimeline } from '@gntik-ai/blocks';
import { BellRing, CircleCheck, Hand, SearchX } from '@gntik-ai/icons';
import {
  Badge,
  Button,
  EmptyState,
  Heading,
  HStack,
  Page,
  PowerSearch,
  SplitLayout,
  Stack,
  Text,
  Timer,
  matchPowerSearch,
  parsePowerSearch,
  type BreadcrumbItem,
  type PowerSearchField,
  type PowerSearchQuery,
} from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  defaultIncidentQuery,
  incidentBreadcrumbs,
  incidentFields,
  incidents as sampleIncidents,
  severityLabels,
  severityTones,
  statusLabels,
  type Incident,
  type IncidentField,
} from './data';

export interface IncidentConsoleProps {
  incidents: Incident[];
  fields: PowerSearchField<IncidentField>[];
  /** Initial filter in PowerSearch syntax (default: not resolved). */
  defaultQuery: string;
  defaultSelectedId: string | null;
  /** Name recorded on acknowledge / resolve events. */
  currentUser: string;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  shell: Omit<ConsoleShellProps, 'children'>;
}

const SEVERITY_ORDER = { sev1: 0, sev2: 1, sev3: 2 } as const;

/** Incident console: PowerSearch-filtered alert rail, detail with elapsed Timer, timeline and acknowledge / resolve. */
export default function IncidentConsolePage(props: Partial<IncidentConsoleProps>) {
  const {
    incidents: initial = sampleIncidents,
    fields = incidentFields,
    defaultQuery = defaultIncidentQuery,
    defaultSelectedId = null,
    currentUser = 'you',
    onAcknowledge,
    onResolve,
    breadcrumbs = incidentBreadcrumbs,
    currentHref = '/incidents',
    shell,
  } = props;
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState<PowerSearchQuery<IncidentField>>(() => parsePowerSearch(defaultQuery, fields));
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId);
  const [showDetail, setShowDetail] = useState(defaultSelectedId != null);
  const ids = useId();

  const visible = items
    .filter((i) => matchPowerSearch(query, i))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.startedAt - a.startedAt);
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const open = items.filter((i) => i.status !== 'resolved').length;

  const transition = (id: string, status: 'acknowledged' | 'resolved') => {
    const at = Date.now();
    setItems((list) =>
      list.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              resolvedAt: status === 'resolved' ? at : i.resolvedAt,
              assignee: i.assignee === 'unassigned' ? currentUser : i.assignee,
              events: [
                { id: `${status}-${at}`, status, tone: status === 'resolved' ? 'success' : 'warning', title: statusLabels[status], at, actor: currentUser },
                ...i.events,
              ],
            }
          : i,
      ),
    );
    if (status === 'resolved') onResolve?.(id);
    else onAcknowledge?.(id);
  };

  const list =
    visible.length === 0 ? (
      <EmptyState icon={SearchX} size="sm" className="mx-auto mt-8" title="No incidents match" description="Change or clear the filters." />
    ) : (
      <ul aria-label="Incidents" className="flex flex-col gap-0.5 p-2">
        {visible.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              aria-current={i.id === selectedId ? 'true' : undefined}
              onClick={() => {
                setSelectedId(i.id);
                setShowDetail(true);
              }}
              className="flex w-full flex-col gap-1.5 rounded-lg px-3 py-2.5 text-start hover:bg-accent/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-[current=true]:bg-accent"
            >
              <span className="flex items-center gap-2">
                <Badge tone={severityTones[i.severity]} size="sm">
                  {severityLabels[i.severity]}
                </Badge>
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{i.title}</span>
              </span>
              <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="font-mono">{i.id}</span>
                <span aria-hidden>·</span>
                <span className="min-w-0 flex-1 truncate">{i.service}</span>
                <span>{statusLabels[i.status]}</span>
                <Timer start={i.startedAt} status={i.status === 'resolved' ? 'stopped' : 'running'} end={i.resolvedAt} format="compact" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    );

  const detail = selected ? (
    <article aria-labelledby={`${ids}-title`} className="flex flex-col gap-6 p-5 sm:p-6">
      <Stack gap={3}>
        <HStack gap={2} wrap>
          <Badge tone={severityTones[selected.severity]}>{severityLabels[selected.severity]}</Badge>
          <Badge tone={selected.status === 'resolved' ? 'success' : selected.status === 'acknowledged' ? 'warning' : 'destructive'} variant="outline" dot>
            {statusLabels[selected.status]}
          </Badge>
          <Text as="span" variant="caption" tone="muted" className="font-mono">
            {selected.id} · {selected.service} · {selected.assignee}
          </Text>
        </HStack>
        <Heading id={`${ids}-title`} level={2} size="sm">
          {selected.title}
        </Heading>
        <Text variant="supporting" tone="muted">
          {selected.summary}
        </Text>
        <HStack gap={3} wrap>
          <Text as="span" variant="label">
            {selected.status === 'resolved' ? 'Duration' : 'Elapsed'}
          </Text>
          <Timer
            start={selected.startedAt}
            status={selected.status === 'resolved' ? 'stopped' : 'running'}
            end={selected.resolvedAt}
            showStatus
            size="lg"
            aria-label={`${selected.id} elapsed time`}
          />
        </HStack>
        <HStack gap={2} wrap>
          <Button variant="secondary" icon={Hand} disabled={selected.status !== 'triggered'} onClick={() => transition(selected.id, 'acknowledged')}>
            Acknowledge
          </Button>
          <Button icon={CircleCheck} disabled={selected.status === 'resolved'} onClick={() => transition(selected.id, 'resolved')}>
            Resolve
          </Button>
        </HStack>
      </Stack>
      <section aria-labelledby={`${ids}-timeline`}>
        <Heading id={`${ids}-timeline`} level={3} size="xs" className="mb-3">
          Timeline
        </Heading>
        <StatusTimeline events={selected.events} label={`${selected.id} timeline`} timeFormat="relative" />
      </section>
    </article>
  ) : (
    <EmptyState icon={BellRing} size="sm" titleAs="h2" className="mx-auto mt-16" title="Select an incident" description="Its timeline and actions show up here." />
  );

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="full"
        header={
          <PageHeader
            breadcrumbs={null}
            title="Incidents"
            description="Triage alerts, acknowledge what you own and resolve when service is restored."
            status=""
            meta={[{ label: 'Open', value: String(open) }]}
            tabs={null}
            actions={[]}
          />
        }
      >
        <div className="h-[680px] min-h-0 overflow-hidden rounded-xl border border-border">
          <SplitLayout
            listLabel="Alerts"
            detailLabel="Incident"
            showDetail={showDetail}
            onShowDetailChange={setShowDetail}
            defaultListSize={42}
            listHeader={
              <Stack gap={2} className="w-full">
                <PowerSearch<IncidentField> aria-label="Filter incidents" fields={fields} value={query} onValueChange={setQuery} allowFreeText />
                <Text as="span" variant="caption" tone="muted" aria-live="polite">
                  {visible.length === 1 ? '1 incident' : `${visible.length} incidents`}
                </Text>
              </Stack>
            }
            list={list}
            detail={detail}
          />
        </div>
      </Page>
    </ConsoleShell>
  );
}
