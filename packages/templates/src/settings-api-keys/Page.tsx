import { ConfirmDestructive, CreateApiKeyDialog, DataTable, generateDemoSecret, type ApiKeyExpiry, type ApiKeyScope, type CreateApiKeyInput, type DataTableColumn } from '@gntik-ai/blocks';
import { KeyRound, Plus, Trash2 } from '@gntik-ai/icons';
import { Badge, EmptyState, Timestamp } from '@gntik-ai/ui';
import { useState } from 'react';
import { SettingsFrame, type SettingsFrameOptions } from '../settings-profile/SettingsFrame';
import { apiKeys as defaultKeys, expiries as defaultExpiries, scopes as defaultScopes, type ApiKey } from './data';

export interface SettingsApiKeysProps extends SettingsFrameOptions {
  keys: ApiKey[];
  scopes: ApiKeyScope[];
  expiries: ApiKeyExpiry[];
  /** Creates a key and returns its secret (shown once). Defaults to a demo generator. */
  onCreate: (input: CreateApiKeyInput) => string | Promise<string>;
  /** Revokes a key after the typed confirmation. A rejection shows its message. */
  onRevoke: (key: ApiKey) => void | Promise<void>;
}

const COLUMNS: DataTableColumn<ApiKey>[] = [
  {
    id: 'name',
    header: 'Name',
    accessor: (k) => k.name,
    sortable: true,
    cell: (k) => (
      <div className="min-w-0">
        <div className="truncate text-[13px] font-medium text-foreground">{k.name}</div>
        <div className="font-mono text-[11.5px] text-muted-foreground">{k.prefix}…</div>
      </div>
    ),
  },
  {
    id: 'scopes',
    header: 'Scopes',
    hideable: true,
    cell: (k) => (
      <div className="flex flex-wrap gap-1">
        {k.scopes.map((s) => (
          <Badge key={s} size="sm" className="font-mono">
            {s}
          </Badge>
        ))}
      </div>
    ),
  },
  { id: 'created', header: 'Created', accessor: (k) => k.createdAt, sortable: true, cell: (k) => <Timestamp value={k.createdAt} tooltip={false} /> },
  {
    id: 'lastUsed',
    header: 'Last used',
    accessor: (k) => k.lastUsedAt ?? '',
    sortable: true,
    cell: (k) => (k.lastUsedAt ? <Timestamp value={k.lastUsedAt} tooltip={false} /> : 'Never'),
  },
  { id: 'createdBy', header: 'Created by', accessor: (k) => k.createdBy, defaultHidden: true },
];

/** API keys settings: DataTable of keys, CreateApiKeyDialog (header action), revoke via ConfirmDestructive. */
export default function SettingsApiKeysPage({
  keys = defaultKeys,
  scopes = defaultScopes,
  expiries = defaultExpiries,
  onCreate = () => generateDemoSecret(),
  onRevoke,
  ...frame
}: Partial<SettingsApiKeysProps>) {
  const [created, setCreated] = useState<ApiKey[]>([]);
  const [revokedIds, setRevokedIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [revoking, setRevoking] = useState<ApiKey | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const rows = [...created, ...keys].filter((k) => !revokedIds.includes(k.id));

  const create = async (input: CreateApiKeyInput) => {
    const secret = await onCreate(input);
    setCreated((list) => [
      { id: `new-${list.length}-${input.name}`, name: input.name, prefix: secret.slice(0, 12), scopes: input.scopes, createdAt: new Date().toISOString(), lastUsedAt: null, createdBy: 'You' },
      ...list,
    ]);
    return secret;
  };

  const revoke = async () => {
    if (!revoking) return;
    await onRevoke?.(revoking);
    setRevokedIds((ids) => [...ids, revoking.id]);
  };

  return (
    <SettingsFrame
      page="api-keys"
      width="wide"
      description="Keys authenticate scripts and services against the API. Treat them like passwords."
      actions={[{ label: 'Create API key', icon: Plus, variant: 'primary', onClick: () => setCreateOpen(true) }]}
      {...frame}
    >
      <DataTable
        rows={rows}
        columns={COLUMNS}
        caption="API keys"
        showCaption
        paginated={false}
        getRowLabel={(k) => k.name}
        rowActions={(k) => [
          {
            label: 'Revoke key',
            icon: Trash2,
            destructive: true,
            onSelect: () => {
              setRevoking(k);
              setConfirmOpen(true);
            },
          },
        ]}
        emptyState={<EmptyState icon={KeyRound} title="No API keys" description="Create a key to call the API from scripts and services." />}
      />
      <CreateApiKeyDialog trigger={null} open={createOpen} onOpenChange={setCreateOpen} scopes={scopes} expiries={expiries} onCreate={create} />
      {revoking && (
        <ConfirmDestructive
          key={revoking.id}
          triggerLabel={null}
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          resourceName={revoking.name}
          resourceType="API key"
          title="Revoke API key?"
          confirmLabel="Revoke key"
          consequences={['Requests signed with this key start failing immediately', 'Scripts and services using it must get a new key']}
          onConfirm={revoke}
        />
      )}
    </SettingsFrame>
  );
}
