import { useRef } from 'react';
import { Button } from '../../Button';
import { VirtualList, type VirtualListHandle } from '../VirtualList';

const levels = ['info', 'info', 'info', 'warn', 'info', 'error'] as const;
const logs = Array.from({ length: 5000 }, (_, i) => ({
  id: `log-${i}`,
  time: `12:${String(Math.floor(i / 60) % 60).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
  level: levels[i % levels.length] ?? 'info',
  message: `deploy-gate: checked deployment #${4100 + i} for open incidents`,
}));

const levelClass = { info: 'text-muted-foreground', warn: 'text-warning-text', error: 'text-destructive-text' } as const;

export default function VirtualListLogs() {
  const list = useRef<VirtualListHandle>(null);
  return (
    <div className="flex max-w-2xl flex-col gap-2">
      <div className="flex items-center gap-2">
        <h3 id="logs-title" className="flex-1 text-[13px] font-semibold text-foreground">
          Deployment log <span className="font-normal text-muted-foreground">· {logs.length.toLocaleString('en-US')} lines</span>
        </h3>
        <Button size="sm" variant="secondary" onClick={() => list.current?.scrollToIndex(logs.length - 1, { focus: true })}>
          Jump to latest
        </Button>
      </div>
      <VirtualList
        ref={list}
        aria-labelledby="logs-title"
        items={logs}
        getKey={(l) => l.id}
        itemHeight={30}
        height={280}
        rowClassName="gap-3 px-3 font-mono text-[12px]"
        renderItem={(l) => (
          <>
            <span className="shrink-0 text-muted-foreground tabular-nums">{l.time}</span>
            <span className={`w-10 shrink-0 font-semibold uppercase ${levelClass[l.level]}`}>{l.level}</span>
            <span className="min-w-0 truncate text-foreground">{l.message}</span>
          </>
        )}
      />
    </div>
  );
}
