import { StatusTag } from '../StatusTag';
import type { StatusDefinition } from '../statusTag.variants';

/** Product-specific states are passed in, never hardcoded in the component. */
const DEPLOYMENT_STATES: Record<string, StatusDefinition> = {
  building: { label: 'Building', tone: 'info' },
  live: { label: 'Live', tone: 'primary' },
  rolled_back: { label: 'Rolled back', tone: 'warning' },
};

export default function StatusTagStates() {
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {['running', 'queued', 'paused', 'draft', 'degraded', 'failed'].map((s) => (
          <StatusTag key={s} status={s} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {['building', 'live', 'rolled_back'].map((s) => (
          <StatusTag key={s} status={s} statuses={DEPLOYMENT_STATES} uppercase size="sm" />
        ))}
      </div>
    </div>
  );
}
