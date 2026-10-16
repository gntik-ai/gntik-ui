import { Collapsible, CollapsiblePanel, CollapsibleTrigger, JsonViewer } from '@gntik-ai/ui';
import { LoadMoreFooter } from '../LoadMoreFooter';
import { useMockCursor } from './useMockCursor';

/** A mocked cursor consumer can append cards just as it appends table rows. */
export default function CardsExample() {
  const { rows, load, ...state } = useMockCursor();
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <Collapsible key={row.id} variant="row">
          <CollapsibleTrigger>{row.name}</CollapsibleTrigger>
          <CollapsiblePanel>
            <JsonViewer label={`${row.name} data`} data={row} />
          </CollapsiblePanel>
        </Collapsible>
      ))}
      {/* Settle loading=false and its result in one update; split settles are unsupported. */}
      <LoadMoreFooter {...state} loadedCount={rows.length} onLoadMore={load} onRetry={load} />
    </div>
  );
}
