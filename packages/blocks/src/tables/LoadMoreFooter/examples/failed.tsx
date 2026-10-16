import { useState } from 'react';
import { LoadMoreFooter } from '../LoadMoreFooter';

export default function FailedExample() {
  const [state, setState] = useState({ loading: false, error: 'Could not load more items.' });
  const retry = async () => {
    setState((previous) => ({ ...previous, loading: true }));
    await Promise.resolve();
    // Settle loading=false with its result in one update. Split settles are unsupported.
    setState({ loading: false, error: '' });
  };
  return <LoadMoreFooter nextCursor="c1" loadedCount={20} {...state} onLoadMore={retry} onRetry={retry} />;
}
