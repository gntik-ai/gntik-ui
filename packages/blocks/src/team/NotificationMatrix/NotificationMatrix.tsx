import { Checkbox, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, cn } from '@gntik-ai/ui';
import { useState } from 'react';
import {
  notificationChannels,
  notificationDefaults,
  notificationEvents,
  type NotificationChannel,
  type NotificationEvent,
  type NotificationMatrixValue,
} from './fixtures';

export type { NotificationChannel, NotificationEvent, NotificationMatrixValue } from './fixtures';

export interface NotificationMatrixProps {
  channels?: NotificationChannel[];
  events?: NotificationEvent[];
  /** Event id → enabled channel ids (controlled). */
  value?: NotificationMatrixValue;
  defaultValue?: NotificationMatrixValue;
  onValueChange?: (value: NotificationMatrixValue) => void;
  caption?: string;
  className?: string;
}

/**
 * Event × channel grid of checkboxes. Column headers toggle a channel for every event, the last
 * column toggles every channel for one event; both show the mixed state. Locked cells stay on.
 */
export function NotificationMatrix({
  channels = notificationChannels,
  events = notificationEvents,
  value: valueProp,
  defaultValue = notificationDefaults,
  onValueChange,
  caption = 'Notification preferences',
  className,
}: NotificationMatrixProps) {
  const [inner, setInner] = useState<NotificationMatrixValue>(defaultValue);
  const value = valueProp ?? inner;
  const isOn = (e: NotificationEvent, c: string) => !!e.locked?.includes(c) || !!value[e.id]?.includes(c);

  const commit = (next: NotificationMatrixValue) => {
    setInner(next);
    onValueChange?.(next);
  };

  /** Sets the given (event, channel) cells, keeping locked ones on and the channel order stable. */
  const setCells = (cells: Array<[NotificationEvent, string]>, on: boolean) => {
    const next: NotificationMatrixValue = { ...value };
    for (const [e, c] of cells) {
      const current = new Set(next[e.id] ?? []);
      if (on || e.locked?.includes(c)) current.add(c);
      else current.delete(c);
      next[e.id] = channels.map((ch) => ch.id).filter((id) => current.has(id));
    }
    commit(next);
  };

  const state = (cells: Array<[NotificationEvent, string]>) => {
    const editable = cells.filter(([e, c]) => !e.locked?.includes(c));
    const on = editable.filter(([e, c]) => isOn(e, c)).length;
    return { checked: editable.length > 0 && on === editable.length, indeterminate: on > 0 && on < editable.length, disabled: editable.length === 0 };
  };

  return (
    <Table className={cn('min-w-[520px]', className)}>
      <TableCaption srOnly>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Event</TableHead>
          {channels.map((c) => {
            const cells = events.map((e): [NotificationEvent, string] => [e, c.id]);
            const s = state(cells);
            return (
              <TableHead key={c.id} align="center" className="w-24">
                <div className="flex flex-col items-center gap-1.5">
                  <span>{c.label}</span>
                  <Checkbox aria-label={`All events by ${c.label}`} {...s} onCheckedChange={(on) => setCells(cells, on)} />
                </div>
              </TableHead>
            );
          })}
          <TableHead align="center" className="w-20">
            All
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((e) => {
          const cells = channels.map((c): [NotificationEvent, string] => [e, c.id]);
          const s = state(cells);
          return (
            <TableRow key={e.id}>
              <TableCell>
                <div className="text-[13px] font-medium text-foreground">{e.label}</div>
                {e.description && <div className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{e.description}</div>}
              </TableCell>
              {channels.map((c) => {
                const locked = !!e.locked?.includes(c.id);
                return (
                  <TableCell key={c.id} align="center">
                    <Checkbox
                      aria-label={`${e.label} by ${c.label}${locked ? ' (always on)' : ''}`}
                      checked={isOn(e, c.id)}
                      disabled={locked}
                      onCheckedChange={(on) => setCells([[e, c.id]], on)}
                    />
                  </TableCell>
                );
              })}
              <TableCell align="center">
                <Checkbox aria-label={`All channels for ${e.label}`} {...s} onCheckedChange={(on) => setCells(cells, on)} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
