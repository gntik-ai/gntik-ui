import { Search } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../../Input';
import { JsonViewer } from '../JsonViewer';

const PAYLOAD = {
  id: 'dep_8f2k1',
  project: 'billing-api',
  status: 'healthy',
  replicas: 3,
  autoscale: true,
  region: 'eu-west-1',
  owner: null,
  labels: { team: 'platform', tier: 'critical', 'cost-center': 'cc-204' },
  containers: [
    { name: 'api', image: 'registry.example.com/billing-api:2.14.0', cpu: 0.5, memory: '512Mi' },
    { name: 'worker', image: 'registry.example.com/billing-worker:2.14.0', cpu: 0.25, memory: '256Mi' },
  ],
  lastDeploy: { at: '2026-05-12T09:41:00Z', by: 'maria.ruiz', durationMs: 94120 },
};

export default function JsonViewerPayload() {
  const [query, setQuery] = useState('');
  return (
    <div className="grid w-full max-w-lg gap-3">
      <Input aria-label="Search keys and values" placeholder="Search keys and values" leadingIcon={Search} value={query} onChange={(e) => setQuery(e.target.value)} />
      <JsonViewer label="Deployment payload" data={PAYLOAD} search={query} maxHeight={320} />
    </div>
  );
}
