import { useState } from 'react';
import { LoadMoreFooter } from '../LoadMoreFooter';
import { LOAD_MORE_RECORDS } from '../fixtures';

export default function FlagExample() {
  const [state, setState] = useState({ rows: LOAD_MORE_RECORDS.slice(0, 2), hasMore: true, loading: false, error: '' });
  const [lastAppend, setLastAppend] = useState<{ seq: number; count: number }>();
  const load = async () => {
    setState((previous) => ({ ...previous, loading: true }));
    const batch = await Promise.resolve(LOAD_MORE_RECORDS.slice(2));
    // Same-tick updates are batched: settle loading=false together with the result. Split settles are unsupported.
    setState((previous) => ({ rows: [...previous.rows, ...batch], hasMore: false, loading: false, error: '' }));
    setLastAppend({ seq: 1, count: batch.length });
  };
  return (
    <div className="space-y-4">
      <ul>
        {state.rows.map((row) => (
          <li key={row.id}>{row.name}</li>
        ))}
      </ul>
      <LoadMoreFooter
        hasMore={state.hasMore}
        loading={state.loading}
        error={state.error}
        loadedCount={state.rows.length}
        lastAppend={lastAppend}
        onLoadMore={load}
        exhaustedFocusTarget="root"
      />
    </div>
  );
}
