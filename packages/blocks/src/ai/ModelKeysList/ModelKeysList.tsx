import { useEffect, useId, useRef, useState } from 'react';
import { KeyRound, Plus, PlugZap, Trash2 } from '@gntik-ai/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Spinner,
  StatusTag,
  cn,
  type StatusDefinition,
} from '@gntik-ai/ui';
import { modelKeys, type ModelKey, type ModelKeyStatus } from './fixtures';

export type { ModelKey, ModelKeyStatus } from './fixtures';

export const MODEL_KEY_STATUSES: Record<ModelKeyStatus, StatusDefinition> = {
  connected: { label: 'Connected', tone: 'success' },
  failing: { label: 'Failing', tone: 'destructive' },
  untested: { label: 'Untested', tone: 'neutral' },
  revoked: { label: 'Revoked', tone: 'neutral' },
};

export interface ModelKeysListProps {
  keys?: ModelKey[];
  title?: string;
  /** Tests a key; resolve true when the provider answered. Defaults to a simulated check. */
  onTest?: (key: ModelKey) => Promise<boolean> | boolean;
  /** Called after the revoke is confirmed. */
  onRevoke?: (key: ModelKey) => void;
  /** Shows an "Add key" button. */
  onAdd?: () => void;
  className?: string;
}

const simulateTest = (key: ModelKey) =>
  new Promise<boolean>((resolve) => setTimeout(() => resolve(key.status !== 'failing'), 900));

/** Provider keys with masked secrets, connection tests and confirmed revocation. */
export function ModelKeysList({
  keys = modelKeys,
  title = 'Model provider keys',
  onTest = simulateTest,
  onRevoke,
  onAdd,
  className,
}: ModelKeysListProps) {
  const titleId = useId();
  const [statuses, setStatuses] = useState<Record<string, ModelKeyStatus>>({});
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [announcement, setAnnouncement] = useState('');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const statusOf = (k: ModelKey) => statuses[k.id] ?? k.status;

  const test = async (key: ModelKey) => {
    setTesting((t) => ({ ...t, [key.id]: true }));
    setAnnouncement(`Testing ${key.name}…`);
    let ok = false;
    try {
      ok = await onTest(key);
    } catch {
      ok = false;
    }
    if (!mounted.current) return;
    setTesting((t) => ({ ...t, [key.id]: false }));
    setStatuses((s) => ({ ...s, [key.id]: ok ? 'connected' : 'failing' }));
    setAnnouncement(ok ? `${key.name}: connection OK` : `${key.name}: connection failed`);
  };

  const revoke = (key: ModelKey) => {
    setStatuses((s) => ({ ...s, [key.id]: 'revoked' }));
    setAnnouncement(`${key.name} revoked`);
    onRevoke?.(key);
  };

  return (
    <Card className={cn('w-full', className)} aria-labelledby={titleId} role="region">
      <CardHeader divided>
        <div>
          <CardTitle id={titleId}>{title}</CardTitle>
          <CardDescription>Keys are stored encrypted and only shown masked.</CardDescription>
        </div>
        {onAdd && (
          <CardAction>
            <Button size="sm" icon={Plus} onClick={onAdd}>
              Add key
            </Button>
          </CardAction>
        )}
      </CardHeader>
      {keys.length === 0 ? (
        <EmptyState icon={KeyRound} title="No provider keys" description="Add a key to let assistants call a model provider." />
      ) : (
        <ul aria-labelledby={titleId} className="divide-y divide-border">
          {keys.map((key) => {
            const status = statusOf(key);
            const revoked = status === 'revoked';
            const busy = testing[key.id] ?? false;
            return (
              <li key={key.id} className={cn('flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center', revoked && 'opacity-60')}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                    <KeyRound size={16} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-medium text-foreground">{key.name}</span>
                      <StatusTag size="sm" status={status} statuses={MODEL_KEY_STATUSES} />
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {key.provider}
                      {key.endpoint && <span className="font-mono"> · {key.endpoint}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:justify-end">
                  <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[11.5px] text-foreground">{key.maskedKey}</code>
                  {key.lastUsed && <span className="hidden text-[11.5px] text-muted-foreground md:inline">Used {key.lastUsed}</span>}
                  {!revoked && (
                    <div className="ml-auto flex items-center gap-1.5 sm:ml-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        aria-label={busy ? `Testing ${key.name}` : `Test ${key.name}`}
                        aria-busy={busy || undefined}
                        disabled={busy}
                        focusableWhenDisabled
                        onClick={() => void test(key)}
                      >
                        {busy ? <Spinner size={14} /> : <PlugZap size={14} aria-hidden />}
                        {busy ? 'Testing…' : 'Test'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger render={<Button variant="ghost" size="sm" icon={Trash2} aria-label={`Revoke ${key.name}`} />}>
                          Revoke
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader tone="destructive">
                            <AlertDialogTitle>Revoke “{key.name}”?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Requests that use this {key.provider} key will fail immediately. You can add a new key at any time.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction icon={Trash2} onClick={() => revoke(key)}>
                              Revoke key
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </Card>
  );
}
