import { useState } from 'react';
import { LOAD_MORE_RECORDS } from '../fixtures';

/** Mock consumer: real consumers normalize cursors and preserve their filters here. */
export function useMockCursor() {
  const [state, setState] = useState({
    rows: LOAD_MORE_RECORDS.slice(0, 2),
    nextCursor: 'c1' as string | null,
    loading: false,
    error: '',
    lastAppend: undefined as { seq: number; count: number } | undefined,
  });
  const load = async (cursor?: string) => {
    setState((previous) => ({ ...previous, loading: true }));
    try {
      const batch = await Promise.resolve(cursor === 'c1' ? LOAD_MORE_RECORDS.slice(2) : []);
      // Settle loading=false and the result together in one update. Split settles are unsupported.
      setState((previous) => ({
        rows: [...previous.rows, ...batch],
        nextCursor: null,
        loading: false,
        error: '',
        lastAppend: { seq: (previous.lastAppend?.seq ?? 0) + 1, count: batch.length },
      }));
    } catch {
      setState((previous) => ({ ...previous, loading: false, error: 'Could not load more items.' }));
    }
  };
  return { ...state, load };
}
