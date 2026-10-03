import { DataTable, NoResultsEmpty, PageHeader, type DataTableColumn } from '@gntik-ai/blocks';
import { Braces, Columns3, Download } from '@gntik-ai/icons';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  JsonViewer,
  Page,
  PowerSearch,
  StatusTag,
  TransferList,
  emptyPowerSearchQuery,
  formatPowerSearch,
  matchPowerSearch,
  type BreadcrumbItem,
  type PowerSearchField,
  type PowerSearchQuery,
  type TransferListItem,
} from '@gntik-ai/ui';
import { useMemo, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { explorerBreadcrumbs, explorerColumns, explorerDefaultColumns, explorerFields, explorerRows, type ExplorerField, type ExplorerRow } from './data';

export interface DataExplorerProps {
  title: string;
  /** Dataset name shown in the description, e.g. "request_logs". */
  dataset: string;
  rows: ExplorerRow[];
  /** PowerSearch fields (structured filters) of the dataset. */
  fields: PowerSearchField<ExplorerField>[];
  /** Columns the chooser offers, in default order. */
  columns: Array<TransferListItem & { value: ExplorerField }>;
  /** Visible columns initially, in order. */
  defaultColumns: ExplorerField[];
  /** Initial query (e.g. from the URL). */
  defaultQuery: PowerSearchQuery<ExplorerField>;
  /** Receives the filtered rows and visible columns; hidden when omitted. */
  onExport: (rows: ExplorerRow[], columns: ExplorerField[]) => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

const statusKey = (code: number) => (code >= 500 ? 'failed' : code >= 400 ? 'degraded' : 'succeeded');

function cellFor(field: ExplorerField): DataTableColumn<ExplorerRow>['cell'] {
  if (field === 'status') return (r) => <StatusTag size="sm" status={statusKey(r.status)} label={String(r.status)} />;
  if (field === 'durationMs') return (r) => `${r.durationMs} ms`;
  if (field === 'bytes') return (r) => `${(r.bytes / 1024).toFixed(1)} KB`;
  return undefined;
}

/**
 * Data explorer: ConsoleShell + Page with a PowerSearch over a 10k-row DataTable (client
 * filtering, sorting and pagination), a column chooser (TransferList in a Dialog: show, hide
 * and reorder) and a row inspector (Drawer + JsonViewer).
 */
export default function DataExplorerPage(props: Partial<DataExplorerProps>) {
  const {
    title = 'Data explorer',
    dataset = 'request_logs',
    rows = explorerRows,
    fields = explorerFields,
    columns: columnItems = explorerColumns,
    defaultColumns = explorerDefaultColumns,
    defaultQuery,
    onExport,
    breadcrumbs = explorerBreadcrumbs,
    currentHref = '/data',
    shell,
  } = props;
  const [query, setQuery] = useState<PowerSearchQuery<ExplorerField>>(() => defaultQuery ?? (emptyPowerSearchQuery<ExplorerField>()));
  const [visible, setVisible] = useState<string[]>(defaultColumns);
  const [draftColumns, setDraftColumns] = useState<string[]>(defaultColumns);
  const [chooserOpen, setChooserOpen] = useState(false);
  const [inspected, setInspected] = useState<ExplorerRow | null>(null);
  const filtered = useMemo(() => (query.terms.length ? rows.filter((r) => matchPowerSearch(query, r)) : rows), [rows, query]);

  const columns: DataTableColumn<ExplorerRow>[] = visible.flatMap((id) => {
    const item = columnItems.find((c) => c.value === id);
    if (!item) return [];
    const field = item.value;
    const numeric = field === 'durationMs' || field === 'bytes';
    return [
      {
        id: field,
        header: item.label,
        accessor: (r: ExplorerRow) => r[field],
        cell: cellFor(field),
        sortable: true,
        variant: numeric ? 'numeric' : field === 'timestamp' || field === 'path' ? 'mono' : undefined,
      } satisfies DataTableColumn<ExplorerRow>,
    ];
  });

  const actions = [
    {
      label: 'Columns',
      icon: Columns3,
      variant: 'secondary' as const,
      onClick: () => {
        setDraftColumns(visible);
        setChooserOpen(true);
      },
    },
    ...(onExport ? [{ label: 'Export', icon: Download, variant: 'primary' as const, onClick: () => onExport(filtered, visible as ExplorerField[]) }] : []),
  ];

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="full"
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description={
              <>
                Query <span className="font-mono">{dataset}</span>: type <span className="font-mono">field=value</span>, comparisons like{' '}
                <span className="font-mono">duration&gt;500</span> or free text.
              </>
            }
            status=""
            meta={[]}
            tabs={null}
            actions={actions}
          />
        }
      >
        <PowerSearch<ExplorerField> aria-label={`Filter ${dataset}`} fields={fields} value={query} onValueChange={setQuery} placeholder="Filter rows…" />
        <DataTable<ExplorerRow>
          caption={`${dataset} rows`}
          rows={filtered}
          columns={columns}
          getRowLabel={(r) => r.id}
          defaultSort={{ columnId: 'timestamp', direction: 'descending' }}
          defaultDensity="compact"
          defaultPageSize={50}
          pageSizeOptions={[25, 50, 100]}
          showColumnMenu={false}
          toolbar={
            <p aria-live="polite" className="text-[12.5px] text-muted-foreground">
              {filtered.length.toLocaleString('en-US')} of {rows.length.toLocaleString('en-US')} rows
              {query.terms.length > 0 && <span className="ms-2 font-mono">{formatPowerSearch(query)}</span>}
            </p>
          }
          rowActions={(r) => [{ label: 'Inspect row', icon: Braces, onSelect: () => setInspected(r) }]}
          emptyState={<NoResultsEmpty entity="rows" query={formatPowerSearch(query)} filterCount={0} onClearSearch={() => setQuery(emptyPowerSearchQuery<ExplorerField>())} />}
        />
      </Page>
      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Columns</DialogTitle>
            <DialogDescription>Choose the visible columns and their order (Alt+↑/↓ reorders).</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <TransferList items={columnItems} value={draftColumns} onValueChange={setDraftColumns} reorderable titles={{ available: 'Hidden', selected: 'Visible' }} height={280} />
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setChooserOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={draftColumns.length === 0}
              onClick={() => {
                setVisible(draftColumns);
                setChooserOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Drawer open={inspected !== null} onOpenChange={(open) => !open && setInspected(null)}>
        <DrawerContent size="md">
          {inspected && (
            <>
              <DrawerHeader>
                <DrawerTitle className="font-mono">{inspected.id}</DrawerTitle>
                <DrawerDescription>Every field of the row, including hidden columns.</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <JsonViewer key={inspected.id} data={inspected} label={`Row ${inspected.id}`} />
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </ConsoleShell>
  );
}
