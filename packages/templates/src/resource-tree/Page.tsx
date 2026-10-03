import { DataTable, PageHeader, SectionHeader, type DataTableColumn } from '@gntik-ai/blocks';
import { Plus } from '@gntik-ai/icons';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  HStack,
  OverflowList,
  Page,
  SimpleSelect,
  Stack,
  StatusTag,
  Text,
  Timestamp,
  TreeList,
  type BreadcrumbItem,
  type StatusDefinition,
} from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  buildResourceTree,
  groupByLabels,
  groupRows,
  kindIcons,
  resourceTreeBreadcrumbs,
  rowsUnder,
  treeResources,
  type ResourceGroupBy,
  type TreeResource,
} from './data';

export interface ResourceTreeProps {
  resources: TreeResource[];
  defaultGroupBy: ResourceGroupBy;
  /** Initially selected tree node (`team:<name>` or `project:<name>`); none = every resource. */
  defaultNodeId: string | null;
  onOpen: (resource: TreeResource) => void;
  onCreate: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  shell: Omit<ConsoleShellProps, 'children'>;
}

const STATUSES: Record<string, StatusDefinition> = {
  healthy: { label: 'Healthy', tone: 'success' },
  degraded: { label: 'Degraded', tone: 'warning' },
  stopped: { label: 'Stopped', tone: 'neutral' },
};

const GROUP_ITEMS = (Object.keys(groupByLabels) as ResourceGroupBy[]).map((value) => ({ value, label: groupByLabels[value] }));

function columns(onOpen?: (r: TreeResource) => void): DataTableColumn<TreeResource>[] {
  return [
    {
      id: 'name',
      header: 'Name',
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => {
        const Icon = kindIcons[r.kind];
        return (
          <span className="inline-flex items-center gap-2">
            <Icon size={14} aria-hidden className="shrink-0 text-muted-foreground" />
            {onOpen ? (
              <button type="button" onClick={() => onOpen(r)} className="font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring">
                {r.name}
              </button>
            ) : (
              <span className="font-medium text-foreground">{r.name}</span>
            )}
          </span>
        );
      },
    },
    { id: 'project', header: 'Project', accessor: (r) => r.project, sortable: true, variant: 'muted' },
    { id: 'region', header: 'Region', accessor: (r) => r.region, variant: 'mono' },
    { id: 'status', header: 'Status', accessor: (r) => r.status, cell: (r) => <StatusTag status={r.status} statuses={STATUSES} /> },
    {
      id: 'tags',
      header: 'Tags',
      cell: (r) => (
        <OverflowList
          label={`${r.name} tags`}
          items={r.tags}
          max={2}
          renderItem={(t) => (
            <Badge variant="outline" size="sm">
              {t}
            </Badge>
          )}
          renderOverflowItem={(t) => t}
        />
      ),
    },
    { id: 'updated', header: 'Updated', accessor: (r) => r.updatedAt, sortable: true, cell: (r) => <Timestamp value={r.updatedAt} className="text-muted-foreground" /> },
  ];
}

/** Resource index browsed by a team → project TreeList, with grouped DataTables and tag overflow. */
export default function ResourceTreePage(props: Partial<ResourceTreeProps>) {
  const {
    resources = treeResources,
    defaultGroupBy = 'kind',
    defaultNodeId = null,
    onOpen,
    onCreate,
    breadcrumbs = resourceTreeBreadcrumbs,
    currentHref = '/resources',
    shell,
  } = props;
  const [nodeId, setNodeId] = useState<string | null>(defaultNodeId);
  const [groupBy, setGroupBy] = useState<ResourceGroupBy>(defaultGroupBy);
  const ids = useId();
  const tree = buildResourceTree(resources);
  const rows = rowsUnder(resources, nodeId);
  const groups = groupRows(rows, groupBy);
  const scope = nodeId ? nodeId.split(':')[1] : 'All resources';
  const cols = columns(onOpen);

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="wide"
        header={
          <PageHeader
            breadcrumbs={null}
            title="Resources"
            description="Services, databases, buckets and queues by team and project."
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'New resource', icon: Plus, onClick: onCreate }]}
          />
        }
      >
        <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <Card className="self-start">
            <CardHeader divided>
              <CardTitle as="h2">Teams</CardTitle>
            </CardHeader>
            <CardBody className="p-2">
              <Button variant="ghost" size="sm" className="mb-1 w-full justify-start" aria-pressed={nodeId === null} onClick={() => setNodeId(null)}>
                All resources
              </Button>
              <TreeList
                aria-label="Teams and projects"
                nodes={tree}
                defaultExpanded={tree.map((n) => n.id)}
                selectionMode="single"
                selected={nodeId ? [nodeId] : []}
                onSelectedChange={(next) => setNodeId(next[0] ?? null)}
              />
            </CardBody>
          </Card>
          <Stack gap={6} className="min-w-0">
            <HStack gap={3} wrap justify="between">
              <Text id={`${ids}-scope`} as="span" variant="label" aria-live="polite">
                {scope} · {rows.length === 1 ? '1 resource' : `${rows.length} resources`}
              </Text>
              <HStack gap={2}>
                <Text as="span" variant="supporting" tone="muted">
                  Group by
                </Text>
                <SimpleSelect
                  aria-label="Group by"
                  size="sm"
                  items={GROUP_ITEMS}
                  value={groupBy}
                  onValueChange={(v) => v && setGroupBy(v)}
                  className="w-32"
                />
              </HStack>
            </HStack>
            {groups.length === 0 ? (
              <EmptyState size="sm" titleAs="h2" title="No resources here" description="Pick another team or project." />
            ) : (
              groups.map((g) => (
                <section key={g.key} aria-labelledby={`${ids}-${g.key}`}>
                  <SectionHeader headingId={`${ids}-${g.key}`} title={g.label} count={g.rows.length} as="h2" />
                  <DataTable<TreeResource>
                    rows={g.rows}
                    columns={cols}
                    caption={`${g.label} resources`}
                    getRowLabel={(r) => r.name}
                    paginated={false}
                    showDensityToggle={false}
                    showColumnMenu={false}
                    defaultSort={{ columnId: 'name', direction: 'ascending' }}
                  />
                </section>
              ))
            )}
          </Stack>
        </div>
      </Page>
    </ConsoleShell>
  );
}
