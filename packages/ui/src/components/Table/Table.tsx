import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { createContext, useContext, type HTMLAttributes, type Ref, type TdHTMLAttributes, type ThHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { nextSortDirection, tableVariants, type SortDirection, type TableDensity } from './table.variants';

const TableContext = createContext<{ density: TableDensity; sticky: boolean }>({ density: 'comfortable', sticky: false });
const s = tableVariants();

export interface TableProps extends Omit<HTMLAttributes<HTMLTableElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLTableElement>;
  /** Row height: `compact` for dense data, `comfortable` (default) for scanning. */
  density?: TableDensity;
  /** Pins the header row while the container scrolls. Give the container a max height. */
  stickyHeader?: boolean;
  /** Classes for the scroll container (e.g. `max-h-80` with stickyHeader). */
  containerClassName?: string;
  /** Accessible name of the scroll container when it is focusable (stickyHeader). */
  containerLabel?: string;
}

/** Semantic data table in a horizontally scrollable container. */
export function Table({ density = 'comfortable', stickyHeader = false, containerClassName, containerLabel, className, ...props }: TableProps) {
  return (
    <TableContext value={{ density, sticky: stickyHeader }}>
      <div
        className={cn(s.container(), containerClassName)}
        tabIndex={stickyHeader ? 0 : undefined}
        role={stickyHeader ? 'region' : undefined}
        aria-label={stickyHeader ? containerLabel : undefined}
      >
        <table data-density={density} className={cn(s.table(), className)} {...props} />
      </div>
    </TableContext>
  );
}

type SectionProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'className'> & { className?: string; ref?: Ref<HTMLTableSectionElement> };

export function TableHeader({ className, ...props }: SectionProps) {
  return <thead className={cn(s.header(), className)} {...props} />;
}

export function TableBody({ className, ...props }: SectionProps) {
  return <tbody className={cn(s.body(), className)} {...props} />;
}

export function TableFooter({ className, ...props }: SectionProps) {
  return <tfoot className={cn(s.footer(), className)} {...props} />;
}

export interface TableRowProps extends Omit<HTMLAttributes<HTMLTableRowElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLTableRowElement>;
  /** Highlights the row (sets data-selected). Pair with a checkbox that carries the state. */
  selected?: boolean;
}

export function TableRow({ selected, className, ...props }: TableRowProps) {
  return <tr data-selected={selected || undefined} className={cn(s.row(), className)} {...props} />;
}

type Align = 'left' | 'right' | 'center';

export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLTableCellElement>;
  align?: Align;
  /** Makes the header a sort button and sets aria-sort. */
  sortable?: boolean;
  /** Current sort of this column (controlled). */
  sortDirection?: SortDirection;
  /** Called with the next direction (none → ascending ⇄ descending) on click, Enter or Space. */
  onSortChange?: (direction: Exclude<SortDirection, 'none'>) => void;
}

/** Column header. With `sortable`, its content becomes a button and the cell exposes aria-sort. */
export function TableHead({
  align = 'left',
  sortable = false,
  sortDirection = 'none',
  onSortChange,
  scope = 'col',
  className,
  children,
  ...props
}: TableHeadProps) {
  const { density, sticky } = useContext(TableContext);
  const v = tableVariants({ density, sticky, align, active: sortDirection !== 'none' });
  const SortIcon = sortDirection === 'ascending' ? ArrowUp : sortDirection === 'descending' ? ArrowDown : ChevronsUpDown;
  return (
    <th scope={scope} aria-sort={sortable ? sortDirection : undefined} className={cn(v.head(), className)} {...props}>
      {sortable ? (
        <button type="button" className={v.sortButton()} onClick={() => onSortChange?.(nextSortDirection(sortDirection))}>
          {children}
          <SortIcon size={13} aria-hidden className={sortDirection === 'none' ? 'opacity-40' : undefined} />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'className' | 'align'> {
  className?: string;
  ref?: Ref<HTMLTableCellElement>;
  align?: Align;
}

export function TableCell({ align = 'left', className, ...props }: TableCellProps) {
  const { density } = useContext(TableContext);
  return <td className={cn(tableVariants({ density, align }).cell(), className)} {...props} />;
}

export interface TableCaptionProps extends Omit<HTMLAttributes<HTMLTableCaptionElement>, 'className'> {
  className?: string;
  ref?: Ref<HTMLTableCaptionElement>;
  /** Keeps the caption for screen readers only. */
  srOnly?: boolean;
}

/** Table name and summary, shown under the table (or screen-reader only). */
export function TableCaption({ srOnly = false, className, ...props }: TableCaptionProps) {
  return <caption className={cn(srOnly ? 'sr-only' : s.caption(), className)} {...props} />;
}
