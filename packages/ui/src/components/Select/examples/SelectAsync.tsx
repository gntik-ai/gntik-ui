import { useState } from 'react';
import { SimpleSelect, type SimpleSelectItem } from '../Select';

/** Stands in for `fetch('/api/clusters', { signal })`: the list loads the first time the popup opens. */
function loadClusters(_query: string, { signal }: { signal: AbortSignal }): Promise<SimpleSelectItem[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        resolve([
          { value: 'prod-eu', label: 'prod-eu · 12 nodes' },
          { value: 'prod-us', label: 'prod-us · 9 nodes' },
          { value: 'staging', label: 'staging · 3 nodes' },
        ]),
      400,
    );
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export default function SelectAsync() {
  const [cluster, setCluster] = useState<string | null>('prod-eu');
  return (
    <div className="w-full max-w-sm">
      <SimpleSelect
        label="Target cluster"
        // The selected value's label is known up front; the rest loads on open.
        items={[{ value: 'prod-eu', label: 'prod-eu · 12 nodes' }]}
        loadOptions={loadClusters}
        value={cluster}
        onValueChange={setCluster}
      />
    </div>
  );
}
