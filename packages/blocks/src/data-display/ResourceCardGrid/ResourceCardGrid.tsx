import { Copy, ExternalLink, Pencil, Trash2, type LucideIcon } from '@gntik-ai/icons';
import { Avatar, cn, MoreMenu, StatusTag, type MoreMenuAction } from '@gntik-ai/ui';
import { RESOURCE_CARDS } from './fixtures';

export interface ResourceCard {
  id: string;
  name: string;
  description?: string;
  /** Icon tile (a lucide icon). Ignored when `avatar` is set. */
  icon?: LucideIcon;
  /** Avatar instead of the icon tile (people, teams, organisations). */
  avatar?: { name: string; src?: string };
  /** StatusTag state key (running, paused, failed…). */
  status?: string;
  /** Two or three small figures at the bottom of the card. */
  meta?: ReadonlyArray<{ label: string; value: string }>;
}

export type ResourceAction = 'open' | 'rename' | 'duplicate' | 'delete';

export interface ResourceCardGridProps {
  items?: readonly ResourceCard[];
  /** Accessible name of the list. */
  label?: string;
  /** Called with the default actions (Open, Rename, Duplicate, Delete). */
  onAction?: (action: ResourceAction, item: ResourceCard) => void;
  /** Replaces the default menu entirely. Return an empty array to hide the menu. */
  getActions?: (item: ResourceCard) => Array<MoreMenuAction | 'separator'>;
  /** Columns at the widest breakpoint. */
  columns?: 2 | 3 | 4;
  className?: string;
}

const COLS = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-3 xl:grid-cols-4' } as const;

/** Responsive grid of resource cards: icon or avatar, name, status, meta figures and a row-actions MoreMenu. */
export function ResourceCardGrid({ items = RESOURCE_CARDS, label = 'Resources', onAction, getActions, columns = 3, className }: ResourceCardGridProps) {
  const defaults = (item: ResourceCard): Array<MoreMenuAction | 'separator'> => [
    { label: 'Open', icon: ExternalLink, onSelect: () => onAction?.('open', item) },
    { label: 'Rename', icon: Pencil, onSelect: () => onAction?.('rename', item) },
    { label: 'Duplicate', icon: Copy, onSelect: () => onAction?.('duplicate', item) },
    'separator',
    { label: 'Delete', icon: Trash2, destructive: true, onSelect: () => onAction?.('delete', item) },
  ];
  return (
    <ul aria-label={label} className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', COLS[columns], className)}>
      {items.map((item) => {
        const actions = getActions ? getActions(item) : defaults(item);
        const IconCmp = item.icon;
        return (
          <li key={item.id} className="flex min-w-0 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              {item.avatar ? (
                <Avatar name={item.avatar.name} src={item.avatar.src} size="md" shape="rounded" />
              ) : (
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  {IconCmp && <IconCmp size={20} aria-hidden />}
                </span>
              )}
              <div className="flex items-center gap-2">
                {item.status && <StatusTag status={item.status} />}
                {actions.length > 0 && <MoreMenu items={actions} label={`Actions for ${item.name}`} variant="ghost" size="sm" />}
              </div>
            </div>
            <div className="mt-4 min-w-0">
              <h3 className="truncate text-[14px] font-semibold text-foreground">{item.name}</h3>
              {item.description && <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">{item.description}</p>}
            </div>
            {item.meta && item.meta.length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
                {item.meta.map((m) => (
                  <div key={m.label} className="flex min-w-0 flex-col-reverse">
                    <dt className="truncate text-[11px] text-muted-foreground">{m.label}</dt>
                    <dd className="truncate font-mono text-[14px] text-foreground tabular-nums">{m.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}
