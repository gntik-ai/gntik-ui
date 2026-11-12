import { Autocomplete } from '@base-ui/react/autocomplete';
import { Dialog } from '@base-ui/react/dialog';
import { Search } from 'lucide-react';
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { usePortalContainer } from '../../utils/portal';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { Kbd, KbdCombo } from '../Kbd';
import { useAsyncOptions } from '../Combobox/useAsyncOptions';
import { Spinner } from '../Spinner';
import { commandPaletteVariants } from './command-palette.variants';
import {
  filterCommandGroupsWithTotal,
  type CommandEntry,
  type CommandEntryGroup,
  type CommandGroup,
  type CommandItem,
} from './command-filter';
import { appendLoadedGroups, isRetryEntry, retryGroup } from './commandPaletteAsync';
import type { CommandPaletteStore } from './commandPaletteStore';
import { CommandRow, DefaultFooter } from './CommandPaletteParts';
import { useCommandPaletteShortcut } from './useCommandPaletteShortcut';

const s = commandPaletteVariants();

export interface CommandPaletteProps {
  /** Command groups (e.g. Actions, Go to). Items are plain data with an `onSelect`. */
  groups: CommandGroup[];
  /** Shown as the first group while the query is empty. */
  recent?: CommandItem[];
  recentLabel?: string;
  /** Called with every chosen item, after its own `onSelect`. */
  onSelect?: (item: CommandItem) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Registers ⌘K / Ctrl+K to toggle the palette. */
  shortcut?: boolean;
  /** Accessible name of the dialog. */
  label?: string;
  placeholder?: string;
  /** Empty-state text for a query with no matches. */
  emptyText?: (query: string) => ReactNode;
  /** Replaces the footer hints; `false` hides the footer. */
  footer?: ReactNode | false;
  className?: string;
  /**
   * Loads server-side results for the query. Called `debounceMs` after the last change, only while
   * the palette is open and the trimmed query has at least `minQueryLength` characters. The signal
   * aborts when the query changes or the palette closes. Loaded groups render after the static
   * ones in the order returned (no local ranking); an item whose `id` is already listed is skipped.
   */
  loadItems?: (query: string, context: { signal: AbortSignal }) => Promise<readonly CommandGroup[]>;
  /** Wait this long (ms) after the last keystroke before calling `loadItems`. Default 250. */
  debounceMs?: number;
  /** Fewest trimmed characters before `loadItems` runs; loaded groups are hidden below it. Default 1. */
  minQueryLength?: number;
  /** Status text while `loadItems` is pending. Default “Loading…”. */
  loadingText?: ReactNode;
  /** Status text when `loadItems` rejects (a Retry option follows). Default “Couldn’t load results.”. */
  errorText?: ReactNode | ((error: unknown) => ReactNode);
  /** Called with every typed query and with `''` when opening resets it; not called when an item is chosen. */
  onQueryChange?: (query: string) => void;
  /**
   * Scores a static item for the trimmed, non-empty query instead of the built-in fuzzy ranking:
   * below 0 hides it, higher scores come first, ties keep the given order. `() => 0` keeps every
   * item in the given order (for apps that filter on their side).
   */
  filter?: (item: CommandItem, query: string) => number;
  /** Renders at most this many static rows (recent included); the footer then reads “Showing n of total”. */
  limit?: number;
  /** Replaces the row content (icon, label, description, shortcut) inside the option. Keep the label visible. */
  renderItem?: (item: CommandItem) => ReactNode;
  /** Opens and closes the palette from code; it wins over `open`. See `createCommandPaletteStore`. */
  store?: CommandPaletteStore;
  /** Usually a CommandPaletteTrigger. */
  children?: ReactNode;
}

/** Status row classes live here, not in the variants, so the base variants output stays as it was. */
const STATUS_CLASS =
  'flex items-center justify-center gap-2 px-4 py-2 text-[12.5px] text-muted-foreground empty:hidden';

const noopSubscribe = () => () => {};
const alwaysClosed = () => false;

/**
 * ⌘K command palette: a modal dialog with a search input over grouped commands (icon, label,
 * description, shortcut). Typing filters with fuzzy-ish ranking, ArrowUp/Down move the highlight,
 * Enter runs the item and closes, Escape closes. Built on Base UI Dialog + inline Autocomplete.
 */
export function CommandPalette({
  groups,
  recent,
  recentLabel: recentLabelProp,
  onSelect,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  shortcut = true,
  label: labelProp,
  placeholder: placeholderProp,
  emptyText = (q) => (
    <>
      No results for “<span className="text-foreground">{q}</span>”
    </>
  ),
  footer,
  className,
  loadItems,
  debounceMs = 250,
  minQueryLength = 1,
  loadingText,
  errorText,
  onQueryChange,
  filter,
  limit,
  renderItem,
  store,
  children,
}: CommandPaletteProps) {
  const portalContainer = usePortalContainer();
  const { t, locale } = useI18n();
  const recentLabel = recentLabelProp ?? t('commandPalette.recent');
  const label = labelProp ?? t('commandPalette.label');
  const placeholder = placeholderProp ?? t('commandPalette.placeholder');
  const dir = usePortalDir();
  const [openState, setOpenState] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const hintsId = useId();
  const storeOpen = useSyncExternalStore(
    store?.subscribe ?? noopSubscribe,
    store?.isOpen ?? alwaysClosed,
    store?.isOpen ?? alwaysClosed,
  );
  const open = store ? storeOpen : (openProp ?? openState);

  // Every way of opening (trigger, shortcut, `open`, store) starts from an empty query.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) setQuery('');
  }

  const setOpen = (next: boolean) => {
    if (store) {
      if (next) store.open();
      else store.close();
      return;
    }
    setOpenState(next);
    onOpenChange?.(next);
  };
  useCommandPaletteShortcut(() => setOpen(!open), { enabled: shortcut });

  const trimmed = query.trim();
  const gated = !loadItems || trimmed.length < minQueryLength;
  const async = useAsyncOptions<CommandGroup>(loadItems, trimmed, { debounceMs, enabled: open && !gated });
  const loading = !gated && async.loading;
  const failed = !gated && !async.loading && async.error != null;

  const callbacks = useRef({ onOpenChange, onQueryChange });
  useEffect(() => {
    callbacks.current = { onOpenChange, onQueryChange };
  });
  const prevOpen = useRef(open);
  const { reload } = async;
  useEffect(() => {
    if (prevOpen.current === open) return;
    prevOpen.current = open;
    if (open) callbacks.current.onQueryChange?.('');
    else reload(); // a new session asks again instead of reusing the last session's result
    if (store) callbacks.current.onOpenChange?.(open);
  }, [open, store, reload]);

  const warned = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && store && openProp !== undefined && !warned.current) {
      warned.current = true;
      console.warn('CommandPalette: both `store` and `open` are set; the store wins and `open` is ignored.');
    }
  }, [store, openProp]);

  const filtered = filterCommandGroupsWithTotal(groups, query, recent, recentLabel, locale, { score: filter, limit });
  const loadedGroups = appendLoadedGroups(filtered.groups, gated ? [] : async.items);
  const count = loadedGroups.reduce((n, g) => n + g.items.length, 0);
  const total = filtered.total + (count - filtered.groups.reduce((n, g) => n + g.items.length, 0));
  const visible: CommandEntryGroup[] = failed ? [...loadedGroups, retryGroup(t('common.retry'))] : loadedGroups;
  const run = (item: CommandItem) => {
    if (item.disabled) return;
    setOpen(false);
    item.onSelect?.();
    onSelect?.(item);
  };
  const activate = (entry: CommandEntry) => (isRetryEntry(entry) ? reload() : run(entry.item));

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      {children}
      <Dialog.Portal container={portalContainer}>
        <Dialog.Backdrop className={s.backdrop()} />
        <Dialog.Viewport dir={dir} className={s.viewport()}>
          <Dialog.Popup aria-label={label} className={cn(s.popup(), className)}>
            <Autocomplete.Root
              open
              inline
              items={visible}
              filter={null}
              value={query}
              onValueChange={(v, details) => {
                if (details.reason === 'item-press' || v === query) return;
                setQuery(v);
                onQueryChange?.(v);
              }}
              itemToStringValue={(entry: CommandEntry) => entry.item.label}
              autoHighlight="always"
              keepHighlight
            >
              <div className={s.inputRow()}>
                <Search size={17} aria-hidden className={s.inputIcon()} />
                <Autocomplete.Input
                  aria-label={placeholder.replace(/…$/, '')}
                  aria-describedby={footer === false ? undefined : hintsId}
                  placeholder={placeholder}
                  className={s.input()}
                />
                <Kbd size="sm" label="Escape">
                  esc
                </Kbd>
              </div>
              <div className={s.results()}>
                {loadItems && (
                  <Autocomplete.Status className={cn(STATUS_CLASS, failed && 'text-destructive-text')}>
                    {loading ? (
                      <>
                        <Spinner size={13} />
                        {loadingText ?? t('common.loading')}
                      </>
                    ) : failed ? (
                      typeof errorText === 'function' ? (
                        errorText(async.error)
                      ) : (
                        (errorText ?? t('commandPalette.loadFailed'))
                      )
                    ) : null}
                  </Autocomplete.Status>
                )}
                <Autocomplete.Empty className={s.empty()}>
                  {count === 0 && trimmed && !loading && !failed ? emptyText(trimmed) : null}
                </Autocomplete.Empty>
                <Autocomplete.List
                  tabIndex={0}
                  aria-busy={loading || undefined}
                  className={s.list({ class: 'focus-ring-inset' })}
                >
                  {(group: CommandEntryGroup, index: number) => (
                    <Autocomplete.Group key={`${index}:${group.value}`} items={group.items} className={s.group()}>
                      {group.value && (
                        <Autocomplete.GroupLabel className={s.groupLabel()}>{group.value}</Autocomplete.GroupLabel>
                      )}
                      <Autocomplete.Collection>
                        {(entry: CommandEntry) => (
                          <CommandRow key={entry.key} entry={entry} onActivate={activate} renderItem={renderItem} />
                        )}
                      </Autocomplete.Collection>
                    </Autocomplete.Group>
                  )}
                </Autocomplete.List>
              </div>
              {footer === false ? null : (footer ?? <DefaultFooter count={count} total={total} id={hintsId} />)}
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface CommandPaletteTriggerProps extends Omit<Dialog.Trigger.Props, 'className'> {
  className?: string;
  /** Keys shown on the right. */
  keys?: string[];
  children?: ReactNode;
}

/** Search-style button that opens the palette; place it inside <CommandPalette>. */
export function CommandPaletteTrigger({
  className,
  keys = ['mod', 'K'],
  children: childrenProp,
  ...props
}: CommandPaletteTriggerProps) {
  const { t } = useI18n();
  const children = childrenProp ?? t('commandPalette.trigger');
  return (
    <Dialog.Trigger className={cn(s.trigger(), className)} {...props}>
      <Search size={16} aria-hidden />
      <span className={s.triggerText()}>{children}</span>
      <KbdCombo size="sm" keys={keys} />
    </Dialog.Trigger>
  );
}
