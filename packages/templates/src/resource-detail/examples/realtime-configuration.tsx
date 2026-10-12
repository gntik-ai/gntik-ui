import ResourceDetailPage from '../Page';
import { shell } from './shell';

export default function RealtimeConfiguration() {
  const configuration = {
    workspaceId: 'workspace_42',
    realtimeEndpointUrl: 'https://realtime.example.com',
    features: ['Subscriptions', 'Presence'],
    dataSources: ['primary'],
  };
  // No history field exists in this response, so omit history entirely.
  return (
    <ResourceDetailPage
      readOnly
      name="Realtime configuration"
      overviewTitle="Connection details"
      details={[
        { id: 'workspace', label: 'Workspace ID', value: configuration.workspaceId, mono: true },
        { id: 'endpoint', label: 'Endpoint', value: configuration.realtimeEndpointUrl, mono: true },
        { id: 'features', label: 'Features', value: configuration.features.join(', ') },
        { id: 'sources', label: 'Data sources', value: configuration.dataSources.join(', ') },
      ]}
      shell={shell}
    />
  );
}
