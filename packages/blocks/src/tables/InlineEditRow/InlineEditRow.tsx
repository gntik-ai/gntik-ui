import { Check, Pencil, X } from '@gntik-ai/icons';
import { cn, IconButton, Input, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@gntik-ai/ui';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { EDITABLE_MEMBER_FIELDS, EDITABLE_MEMBERS, type EditableMember } from './fixtures';

type Editable = string | number;

export interface InlineEditField<T> {
  key: Extract<keyof T, string>;
  label: string;
  type?: 'text' | 'number' | 'email';
  align?: 'left' | 'right';
  required?: boolean;
  /** Read-mode cell classes. */
  className?: string;
}

export interface InlineEditRowProps<T extends object> {
  row: T;
  fields: ReadonlyArray<InlineEditField<T>>;
  /** Called with the edited row on Save (or Enter). */
  onSave?: (next: T) => void;
  onCancel?: () => void;
  /** Row name for the Edit button label ("Edit Ana Lopez"). */
  rowLabel?: string;
  /** Start in edit mode. */
  defaultEditing?: boolean;
}

const read = <T extends object>(row: T, key: string): Editable => {
  const v = (row as Record<string, unknown>)[key];
  return typeof v === 'number' ? v : v == null ? '' : String(v);
};

/**
 * A table row that switches into edit mode: inputs replace the cells, with Save and Cancel.
 * Enter saves, Escape cancels; focus moves to the first input and back to Edit afterwards.
 */
export function InlineEditRow<T extends object>({ row, fields, onSave, onCancel, rowLabel, defaultEditing = false }: InlineEditRowProps<T>) {
  const [editing, setEditing] = useState(defaultEditing);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const editRef = useRef<HTMLButtonElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef(false);
  const label = rowLabel ?? String(read(row, fields[0]?.key ?? ''));

  useEffect(() => {
    if (editing) firstInputRef.current?.focus();
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      editRef.current?.focus();
    }
  }, [editing]);

  const start = () => {
    setDraft(Object.fromEntries(fields.map((f) => [f.key, String(read(row, f.key))])));
    setEditing(true);
  };
  const finish = () => {
    restoreFocus.current = true;
    setEditing(false);
  };
  const invalid = (f: InlineEditField<T>) => f.required === true && (draft[f.key] ?? '').trim() === '';
  const save = () => {
    if (fields.some(invalid)) return;
    const next = { ...row } as Record<string, unknown>;
    for (const f of fields) {
      const value = draft[f.key] ?? '';
      next[f.key] = f.type === 'number' ? Number(value) : value;
    }
    onSave?.(next as T);
    finish();
  };
  const cancel = () => {
    onCancel?.();
    finish();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (!editing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    } else if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      save();
    }
  };

  return (
    <TableRow selected={editing} onKeyDown={onKeyDown} data-editing={editing || undefined}>
      {fields.map((f, i) => (
        <TableCell key={f.key} align={f.align} className={cn(!editing && f.className, editing && 'py-1.5')}>
          {editing ? (
            <Input
              ref={i === 0 ? firstInputRef : undefined}
              aria-label={f.label}
              type={f.type ?? 'text'}
              size="sm"
              required={f.required}
              invalid={invalid(f)}
              value={draft[f.key] ?? ''}
              onValueChange={(v) => setDraft((d) => ({ ...d, [f.key]: String(v) }))}
              inputClassName={f.align === 'right' ? 'text-right' : undefined}
              className="min-w-24"
            />
          ) : (
            read(row, f.key)
          )}
        </TableCell>
      ))}
      <TableCell align="right" className="w-24 py-1.5 whitespace-nowrap">
        {editing ? (
          <span className="inline-flex gap-1">
            <IconButton icon={Check} label="Save" size="sm" variant="soft" onClick={save} disabled={fields.some(invalid)} />
            <IconButton icon={X} label="Cancel" size="sm" variant="ghost" onClick={cancel} />
          </span>
        ) : (
          <IconButton ref={editRef} icon={Pencil} label={`Edit ${label}`} size="sm" variant="ghost" onClick={start} />
        )}
      </TableCell>
    </TableRow>
  );
}

export interface InlineEditTableProps<T extends object> {
  rows?: readonly T[];
  fields?: ReadonlyArray<InlineEditField<T>>;
  getRowId?: (row: T) => string;
  caption?: string;
  /** Called with the saved row; rows also update locally. */
  onRowSave?: (row: T) => void;
  className?: string;
}

/** Standalone demo of InlineEditRow: a small editable table that keeps its rows in state. */
export function InlineEditTable<T extends object = EditableMember>({
  rows: initialRows = EDITABLE_MEMBERS as unknown as readonly T[],
  fields = EDITABLE_MEMBER_FIELDS as unknown as ReadonlyArray<InlineEditField<T>>,
  getRowId = (row) => String((row as { id?: unknown }).id ?? ''),
  caption = 'Members',
  onRowSave,
  className,
}: InlineEditTableProps<T>) {
  const [rows, setRows] = useState<readonly T[]>(initialRows);
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card shadow-sm', className)}>
      <Table>
        <TableCaption srOnly>{caption}</TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {fields.map((f) => (
              <TableHead key={f.key} align={f.align}>
                {f.label}
              </TableHead>
            ))}
            <TableHead align="right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const id = getRowId(row);
            return (
              <InlineEditRow
                key={id}
                row={row}
                fields={fields}
                onSave={(next) => {
                  setRows((prev) => prev.map((r) => (getRowId(r) === id ? next : r)));
                  onRowSave?.(next);
                }}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
