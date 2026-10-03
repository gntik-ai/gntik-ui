import { Badge, cn } from '@gntik-ai/ui';

export type EnvironmentTone = 'primary' | 'warning' | 'info' | 'neutral' | 'destructive';

/** Default tone per environment name; anything else is neutral. */
export const environmentTones: Record<string, EnvironmentTone> = {
  production: 'primary',
  prod: 'primary',
  staging: 'warning',
  preview: 'info',
  development: 'neutral',
  dev: 'neutral',
};

export interface EnvironmentBadgeProps {
  /** Environment name, e.g. `production`, `staging`, `preview`. */
  environment?: string;
  /** Region or cluster shown after the environment, e.g. `eu-west`; `null` hides it. */
  region?: string | null;
  /** Overrides the tone looked up from `environmentTones`. */
  tone?: EnvironmentTone;
  /** Prefix read by screen readers only. */
  srLabel?: string;
  className?: string;
}

/** Environment + region chip for the topbar or a page header: "production · eu-west". */
export function EnvironmentBadge({ environment = 'production', region = 'eu-west', tone, srLabel = 'Environment:', className }: EnvironmentBadgeProps) {
  const resolved = tone ?? environmentTones[environment.toLowerCase()] ?? 'neutral';
  return (
    <Badge tone={resolved} dot data-environment={environment} className={cn('font-mono text-[10.5px] whitespace-nowrap', className)}>
      <span className="sr-only">{srLabel} </span>
      {environment}
      {region && (
        <>
          <span aria-hidden className="opacity-60">
            ·
          </span>
          <span className="sr-only">, region</span> {region}
        </>
      )}
    </Badge>
  );
}
