import { useState } from 'react';
import { TraceWaterfall } from '../TraceWaterfall';
import { runningTraceSpans } from '../fixtures';

/** A trace still in progress, with controlled selection driving the details pane. */
export default function RunningTraceWaterfall() {
  const [selected, setSelected] = useState<string | null>('r3');
  return <TraceWaterfall title="Live trace" spans={runningTraceSpans} selectedId={selected} onSelectedIdChange={setSelected} />;
}
