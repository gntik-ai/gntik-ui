import type { ReactNode } from 'react';
import { Badge, Card, cn, type BadgeTone } from '@gntik-ai/ui';
import { formatDate, type DateInput } from '../format';
import { samplePlanDefinition } from './fixtures';

export type PlanDefinitionStatus = 'draft' | 'active' | 'deprecated' | 'archived';

export interface PlanDefinition {
  name: string;
  slug: string;
  description?: string;
  status: PlanDefinitionStatus;
  capabilities?: Record<string, boolean>;
  quotas?: Record<string, string | number>;
  tenantCount: number;
  updatedAt: DateInput;
}

export interface PlanDefinitionCardProps {
  plan?: PlanDefinition;
  density?: 'compact' | 'full';
  /** Consumer-supplied kit Buttons or native links; no billing actions. */
  actions?: ReactNode;
  statusLabels?: Partial<Record<PlanDefinitionStatus, string>>;
  titleAs?: 'h2' | 'h3' | 'h4';
  className?: string;
}

const STATUS: Record<PlanDefinitionStatus, { label: string; tone: BadgeTone }> = {
  draft: { label: 'Draft', tone: 'info' },
  active: { label: 'Active', tone: 'success' },
  deprecated: { label: 'Deprecated', tone: 'warning' },
  archived: { label: 'Archived', tone: 'neutral' },
};

/** Administrative plan information, with no commercial fields or actions. */
export function PlanDefinitionCard({
  plan = samplePlanDefinition,
  density = 'full',
  actions,
  statusLabels,
  titleAs: TitleTag = 'h3',
  className,
}: PlanDefinitionCardProps) {
  const status = STATUS[plan.status];
  return (
    <Card className={cn(density === 'compact' ? 'p-4' : 'p-6', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <TitleTag className="text-lg font-semibold text-foreground">{plan.name}</TitleTag>
        <Badge tone={status.tone} dot>
          {statusLabels?.[plan.status] ?? status.label}
        </Badge>
      </div>
      <p className="mt-1 font-mono text-sm text-muted-foreground">{plan.slug}</p>
      {plan.description && <p className="mt-2 text-sm text-foreground">{plan.description}</p>}
      {plan.capabilities && Object.keys(plan.capabilities).length > 0 && (
        <ul aria-label="Capabilities" className={cn('mt-4 grid gap-2 text-sm', density === 'full' && 'sm:grid-cols-2')}>
          {Object.entries(plan.capabilities).map(([name, enabled]) => (
            <li key={name} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-foreground">{name}</span>
              <span className="text-muted-foreground">{enabled ? 'Enabled' : 'Disabled'}</span>
            </li>
          ))}
        </ul>
      )}
      <dl className={cn('mt-4 grid gap-3 text-sm', density === 'full' && 'sm:grid-cols-2')}>
        {plan.quotas &&
          Object.entries(plan.quotas).map(([key, value]) => (
            <div key={key}>
              <dt className="text-muted-foreground">{key}</dt>
              <dd className="font-medium text-foreground">{value}</dd>
            </div>
          ))}
        <div>
          <dt className="text-muted-foreground">Assigned tenants</dt>
          <dd className="font-medium text-foreground tabular-nums">{plan.tenantCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Updated</dt>
          <dd className="text-foreground">{formatDate(plan.updatedAt)}</dd>
        </div>
      </dl>
      {actions && <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>}
    </Card>
  );
}
