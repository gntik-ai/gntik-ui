import { Pause, Play, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../Button';
import { Timer, type TimerStatus } from '../Timer';

interface Run {
  status: TimerStatus;
  start: number;
  offset: number;
  end?: number;
}

export default function TimerStopwatch() {
  const [run, setRun] = useState<Run>(() => ({ status: 'stopped', start: Date.now(), offset: 0, end: Date.now() }));
  const toggle = () =>
    setRun((r) => {
      const t = Date.now();
      return r.status === 'running' ? { ...r, status: 'paused', end: t } : { status: 'running', start: t, offset: r.offset + (r.end ?? t) - r.start };
    });
  const reset = () => setRun({ status: 'stopped', start: Date.now(), offset: 0, end: Date.now() });
  return (
    <div className="flex flex-col items-center gap-4">
      <Timer aria-label="Focus session" size="lg" start={run.start} offset={run.offset} status={run.status} end={run.end} announce />
      <div className="flex gap-2">
        <Button size="sm" icon={run.status === 'running' ? Pause : Play} onClick={toggle}>
          {run.status === 'running' ? 'Pause' : run.status === 'paused' ? 'Resume' : 'Start'}
        </Button>
        <Button size="sm" variant="secondary" icon={RotateCcw} onClick={reset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
