import { Check, Search } from 'lucide-react';
import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Input } from '../Input';
import { transferListVariants } from './transfer-list.variants';

export interface TransferListItem {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

const s = transferListVariants();

export interface TransferListPaneProps {
  id: string;
  title: ReactNode;
  items: TransferListItem[];
  checked: ReadonlySet<string>;
  onCheckedChange: (next: Set<string>) => void;
  /** Moves the given values to the other pane. */
  onTransfer: (values: string[]) => void;
  /** Selected pane only: moves the given values by one position. */
  onReorder?: (values: string[], delta: -1 | 1) => void;
  searchable: boolean;
  searchLabel: string;
  searchPlaceholder: string;
  emptyText: ReactNode;
  noMatchesText: ReactNode;
  countLabel: (checked: number, total: number) => string;
  footer?: ReactNode;
  height: number | string;
}

/** One side of a TransferList: title, search and a multi-select listbox (aria-activedescendant). */
export function TransferListPane({
  id,
  title,
  items,
  checked,
  onCheckedChange,
  onTransfer,
  onReorder,
  searchable,
  searchLabel,
  searchPlaceholder,
  emptyText,
  noMatchesText,
  countLabel,
  footer,
  height,
}: TransferListPaneProps) {
  const [query, setQuery] = useState('');
  const [activeValue, setActiveValue] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((it) => `${it.label} ${it.description ?? ''}`.toLowerCase().includes(q)) : items;
  const activeIndex = Math.max(0, visible.findIndex((it) => it.value === activeValue));
  const active = visible[activeIndex];
  const titleId = `${id}-title`;
  const optionId = (i: number) => `${id}-opt-${i}`;

  useEffect(() => {
    document.getElementById(optionId(activeIndex))?.scrollIntoView?.({ block: 'nearest' });
  });

  const toggle = (value: string, on?: boolean) => {
    const it = items.find((x) => x.value === value);
    if (!it || it.disabled) return;
    const next = new Set(checked);
    if (on ?? !next.has(value)) next.add(value);
    else next.delete(value);
    onCheckedChange(next);
  };

  const targets = () => (checked.size ? items.filter((it) => checked.has(it.value)).map((it) => it.value) : active && !active.disabled ? [active.value] : []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const go = (i: number) => {
      const next = visible[Math.min(Math.max(i, 0), visible.length - 1)];
      if (!next) return;
      setActiveValue(next.value);
      if (e.shiftKey) toggle(next.value, true);
    };
    if (e.altKey && onReorder && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const values = targets();
      if (values.length) onReorder(values, e.key === 'ArrowUp' ? -1 : 1);
      if (active) setActiveValue(active.value);
      return;
    }
    if (e.key === 'ArrowDown') go(activeIndex + 1);
    else if (e.key === 'ArrowUp') go(activeIndex - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(visible.length - 1);
    else if (e.key === ' ' && active) toggle(active.value);
    else if (e.key === 'Enter') {
      const values = targets();
      if (values.length) onTransfer(values);
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
      const all = visible.filter((it) => !it.disabled).map((it) => it.value);
      const allOn = all.every((v) => checked.has(v));
      onCheckedChange(allOn ? new Set([...checked].filter((v) => !all.includes(v))) : new Set([...checked, ...all]));
    } else return;
    e.preventDefault();
  };

  return (
    <section aria-labelledby={titleId} className={s.pane()}>
      <div className={s.paneHead()}>
        <h3 id={titleId} className={s.paneTitle()}>
          {title}
        </h3>
        <span className={s.paneCount()}>{countLabel(checked.size, items.length)}</span>
      </div>
      {searchable && (
        <div className={s.search()}>
          <Input size="sm" type="search" leadingIcon={Search} aria-label={searchLabel} placeholder={searchPlaceholder} value={query} onValueChange={(v: string) => setQuery(v)} />
        </div>
      )}
      <div
        role="listbox"
        aria-multiselectable
        aria-labelledby={titleId}
        aria-activedescendant={active ? optionId(activeIndex) : undefined}
        tabIndex={0}
        className={s.listbox()}
        style={visible.length ? { height } : undefined}
        onKeyDown={onKeyDown}
      >
        {visible.map((it, i) => (
          <div
            key={it.value}
            id={optionId(i)}
            role="option"
            aria-selected={checked.has(it.value)}
            aria-disabled={it.disabled || undefined}
            data-active={(i === activeIndex) || undefined}
            className={cn('group/option', s.option())}
            onClick={() => {
              setActiveValue(it.value);
              toggle(it.value);
            }}
            onDoubleClick={() => !it.disabled && onTransfer([it.value])}
          >
            <span aria-hidden className={s.check()}>
              {checked.has(it.value) && <Check size={11} strokeWidth={3} />}
            </span>
            <span className={s.optionText()}>
              <span className={s.optionLabel()}>{it.label}</span>
              {it.description && <span className={s.optionDescription()}>{it.description}</span>}
            </span>
          </div>
        ))}
      </div>
      {visible.length === 0 && <div className={s.empty()} style={{ height }}>{items.length ? noMatchesText : emptyText}</div>}
      {footer && <div className={s.paneFoot()}>{footer}</div>}
    </section>
  );
}
