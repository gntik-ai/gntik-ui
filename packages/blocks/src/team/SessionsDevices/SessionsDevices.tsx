import { Badge, Button, Timestamp, cn } from '@gntik-ai/ui';
import { LogOut, Monitor, Smartphone, Tablet, type LucideIcon } from '@gntik-ai/icons';
import { useId, useState, type ReactNode } from 'react';
import { deviceSessions, type DeviceKind, type DeviceSession } from './fixtures';

export type { DeviceKind, DeviceSession } from './fixtures';

const KIND_ICON: Record<DeviceKind, LucideIcon> = { desktop: Monitor, mobile: Smartphone, tablet: Tablet };

export interface SessionsDevicesProps {
  sessions?: DeviceSession[];
  onRevoke?: (session: DeviceSession) => void;
  /** Signs out every session except the current one. */
  onRevokeOthers?: (sessions: DeviceSession[]) => void;
  title?: ReactNode;
  description?: ReactNode;
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

/** Signed-in sessions and devices: client, location, last seen, the current one marked, and revoke. */
export function SessionsDevices({
  sessions = deviceSessions,
  onRevoke,
  onRevokeOthers,
  title = 'Sessions and devices',
  description = "Places where you're signed in. Revoke anything you don't recognise.",
  headingLevel: Heading = 'h2',
  className,
}: SessionsDevicesProps) {
  const id = useId();
  const [revoked, setRevoked] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const rows = sessions.filter((s) => !revoked.includes(s.id));
  const others = rows.filter((s) => !s.current);

  const revoke = (list: DeviceSession[]) => {
    setRevoked((r) => [...r, ...list.map((s) => s.id)]);
    setAnnouncement(list.length === 1 ? `Signed out of ${list[0]?.device}.` : `Signed out of ${list.length} sessions.`);
  };

  return (
    <section aria-labelledby={`${id}-title`} className={cn('rounded-lg border border-border bg-card shadow-sm', className)}>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Heading id={`${id}-title`} className="text-[14px] font-semibold tracking-tight text-foreground">
            {title}
          </Heading>
          {description != null && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={LogOut}
          disabled={others.length === 0}
          className="self-start"
          onClick={() => {
            revoke(others);
            onRevokeOthers?.(others);
          }}
        >
          Sign out other sessions
        </Button>
      </div>
      <ul className="divide-y divide-border">
        {rows.map((s) => {
          const KindIcon = KIND_ICON[s.kind];
          return (
            <li key={s.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className={cn('grid size-9 shrink-0 place-items-center rounded-md', s.current ? 'bg-primary/14 text-primary-text' : 'bg-secondary text-muted-foreground')}>
                <KindIcon size={17} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{s.device}</span>
                  {s.current && (
                    <Badge size="sm" tone="success" dot>
                      This device
                    </Badge>
                  )}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                  {s.client} · {s.location}
                  {s.ip && <span className="hidden font-mono sm:inline"> · {s.ip}</span>}
                </div>
                <div className="text-[12px] text-muted-foreground">
                  {s.current ? 'Active now' : (
                    <>
                      Last seen <Timestamp value={s.lastSeen} tooltip={false} />
                    </>
                  )}
                </div>
              </div>
              {!s.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Revoke session on ${s.device}`}
                  onClick={() => {
                    revoke([s]);
                    onRevoke?.(s);
                  }}
                >
                  Revoke
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}
