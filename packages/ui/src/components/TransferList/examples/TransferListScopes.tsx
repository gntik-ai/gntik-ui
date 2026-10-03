import { TransferList } from '../TransferList';

const scopes = ['projects:read', 'projects:write', 'members:read', 'members:invite', 'billing:read', 'invoices:export', 'deployments:trigger'].map((s) => ({
  value: s,
  label: s,
}));

export default function TransferListScopes() {
  return (
    <TransferList
      className="max-w-2xl"
      items={scopes}
      defaultValue={['projects:read']}
      reorderable={false}
      height={180}
      titles={{ available: 'Available scopes', selected: 'Token scopes' }}
    />
  );
}
