import { FlowBuilder, type ConsoleEntry } from '@gntik-ai/blocks';
import { useState } from 'react';

const seed: ConsoleEntry[] = [];

export function Editor() {
  const [log, setLog] = useState(seed);
  return (
    <div>
      <FlowBuilder consoleEntries={seed} title="Pipeline" />
      <FlowBuilder consoleEntries={log} onConsoleChange={setLog} />
    </div>
  );
}
