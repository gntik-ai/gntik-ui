import { Button, cn } from '@gntik-ai/ui';
import { useId, useState, type ReactNode } from 'react';
import { ConfirmDestructiveDialog } from './ConfirmDestructiveDialog';
import { dangerZoneActions, type DangerZoneAction } from './fixtures';

export type { DangerZoneAction } from './fixtures';

export interface DangerZoneProps {
  title?: ReactNode;
  description?: ReactNode;
  actions?: DangerZoneAction[];
  /** Called after the user confirms an action. A returned promise shows a loading state. */
  onConfirm?: (actionId: string) => void | Promise<void>;
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/**
 * Bordered destructive section. Each action opens a confirmation dialog; actions with
 * `confirmText` require typing it (e.g. the project name) before the confirm button enables.
 */
export function DangerZone({
  title = 'Danger zone',
  description = 'These actions affect the whole project and every member who can access it.',
  actions = dangerZoneActions,
  onConfirm,
  headingLevel: Heading = 'h2',
  className,
}: DangerZoneProps) {
  const id = useId();
  const [pending, setPending] = useState<DangerZoneAction | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby={`${id}-title`} className={cn('rounded-lg border border-destructive/35 bg-card shadow-sm', className)}>
      <div className="border-b border-destructive/20 px-6 py-4">
        <Heading id={`${id}-title`} className="text-[15px] font-semibold tracking-tight text-destructive-text">
          {title}
        </Heading>
        {description != null && <p className="mt-1 text-[13px] leading-6 text-pretty text-muted-foreground">{description}</p>}
      </div>
      <ul className="divide-y divide-border">
        {actions.map((action) => (
          <li key={action.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-foreground">{action.title}</div>
              <p className="mt-0.5 max-w-xl text-[12.5px] leading-5 text-pretty text-muted-foreground">{action.description}</p>
            </div>
            <Button
              variant={action.destructive === false ? 'secondary' : 'destructive'}
              className="shrink-0 self-start sm:self-auto"
              onClick={() => {
                setPending(action);
                setOpen(true);
              }}
            >
              {action.actionLabel}
            </Button>
          </li>
        ))}
      </ul>
      {pending && (
        <ConfirmDestructiveDialog
          key={pending.id}
          open={open}
          onOpenChange={setOpen}
          title={`${pending.title}?`}
          description={pending.description}
          confirmText={pending.confirmText}
          confirmLabel={pending.actionLabel}
          onConfirm={() => onConfirm?.(pending.id)}
        />
      )}
    </section>
  );
}
