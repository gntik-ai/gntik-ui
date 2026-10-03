import { Autocomplete } from '@base-ui/react/autocomplete';
import { Dialog } from '@base-ui/react/dialog';
import { ArrowRight, Search } from 'lucide-react';
import { useId, useState, type ReactNode } from 'react';
import { usePortalDir, useI18n } from '../../i18n/I18nProvider';
import { cn } from '../../utils/cn';
import { RTL_FLIP } from '../../utils/rtl';
import { Kbd, KbdCombo } from '../Kbd';
import { commandPaletteVariants } from './command-palette.variants';
import { filterCommandGroups, type CommandEntry, type CommandEntryGroup, type CommandGroup, type CommandItem } from './command-filter';
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
  /** Usually a CommandPaletteTrigger. */
  children?: ReactNode;
}

function CommandRow({ entry, onRun }: { entry: CommandEntry; onRun: (item: CommandItem) => void }) {
  const { item } = entry;
  const v = commandPaletteVariants({ mono: item.mono });
  const IconCmp = item.icon;
  return (
    <Autocomplete.Item value={entry} disabled={item.disabled} onClick={() => onRun(item)} className={v.item()}>
      {IconCmp && <IconCmp size={16} aria-hidden className={v.itemIcon()} />}
      <span className={v.itemText()}>
        <span className={v.itemLabel()}>{item.label}</span>
        {item.description && <span className={v.itemDescription()}>{item.description}</span>}
      </span>
      {item.shortcut?.length ? <KbdCombo size="sm" keys={item.shortcut} /> : <ArrowRight size={14} aria-hidden className={cn(v.itemArrow(), RTL_FLIP)} />}
    </Autocomplete.Item>
  );
}

function DefaultFooter({ count, id }: { count: number; id: string }) {
  const { t } = useI18n();
  return (
    <div className={s.footer()}>
      <span id={id} className={s.hint()}>
        <Kbd size="sm">↑↓</Kbd>
        {t('commandPalette.navigate')}
        <span className="sr-only">,</span>
      </span>
      <span className={s.hint()}>
        <Kbd size="sm">↵</Kbd>
        {t('commandPalette.run')}
      </span>
      <span className={s.hint()}>
        <Kbd size="sm">esc</Kbd>
        {t('commandPalette.close')}
      </span>
      <span className={s.count()} aria-live="polite">
        {t('common.results', { count })}
      </span>
    </div>
  );
}

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
  children,
}: CommandPaletteProps) {
  const { t } = useI18n();
  const recentLabel = recentLabelProp ?? t('commandPalette.recent');
  const label = labelProp ?? t('commandPalette.label');
  const placeholder = placeholderProp ?? t('commandPalette.placeholder');
  const dir = usePortalDir();
  const [openState, setOpenState] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const hintsId = useId();
  const open = openProp ?? openState;

  const setOpen = (next: boolean) => {
    if (next) setQuery('');
    setOpenState(next);
    onOpenChange?.(next);
  };
  useCommandPaletteShortcut(() => setOpen(!open), { enabled: shortcut });

  const visible: CommandEntryGroup[] = filterCommandGroups(groups, query, recent, recentLabel);
  const count = visible.reduce((n, g) => n + g.items.length, 0);

  const run = (item: CommandItem) => {
    if (item.disabled) return;
    setOpen(false);
    item.onSelect?.();
    onSelect?.(item);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(next) => setOpen(next)}>
      {children}
      <Dialog.Portal>
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
                if (details.reason === 'item-press') return;
                setQuery(v);
              }}
              itemToStringValue={(entry: CommandEntry) => entry.item.label}
              autoHighlight="always"
              keepHighlight
            >
              <div className={s.inputRow()}>
                <Search size={17} aria-hidden className={s.inputIcon()} />
                <Autocomplete.Input aria-label={placeholder.replace(/…$/, '')} aria-describedby={footer === false ? undefined : hintsId} placeholder={placeholder} className={s.input()} />
                <Kbd size="sm" label="Escape">
                  esc
                </Kbd>
              </div>
              <div className={s.results()}>
                <Autocomplete.Empty className={s.empty()}>{count === 0 && query.trim() ? emptyText(query.trim()) : null}</Autocomplete.Empty>
                <Autocomplete.List className={s.list()}>
                  {(group: CommandEntryGroup) => (
                    <Autocomplete.Group key={group.value} items={group.items} className={s.group()}>
                      <Autocomplete.GroupLabel className={s.groupLabel()}>{group.value}</Autocomplete.GroupLabel>
                      <Autocomplete.Collection>{(entry: CommandEntry) => <CommandRow key={entry.key} entry={entry} onRun={run} />}</Autocomplete.Collection>
                    </Autocomplete.Group>
                  )}
                </Autocomplete.List>
              </div>
              {footer === false ? null : (footer ?? <DefaultFooter count={count} id={hintsId} />)}
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
export function CommandPaletteTrigger({ className, keys = ['⌘', 'K'], children: childrenProp, ...props }: CommandPaletteTriggerProps) {
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
