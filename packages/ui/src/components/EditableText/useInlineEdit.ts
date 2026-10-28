import { useEffect, useEffectEvent, useRef, useState } from 'react';

export type EditableSaveResult = void | boolean | string;
/** Focus destination after an edit. null preserves the user's blur target. */
export type InlineEditMove = 'self' | 'next' | 'prev' | null;
export type InlineEditParseResult<T> = { ok: true; value: T } | { ok: false; message: string };

export interface UseInlineEditOptions<T> {
  value: T;
  editing?: boolean;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  parse: (draft: string) => InlineEditParseResult<T>;
  onSave: (next: T, previous: T) => EditableSaveResult | Promise<EditableSaveResult>;
  genericError: string;
  onCancel?: () => void;
  validate?: (value: T) => string | undefined;
  isEqual?: (next: T, previous: T) => boolean;
  /** Parse/validation errors pass undefined; rejected saves pass their requested move. */
  focusEditor?: (after?: InlineEditMove) => void;
  onAccepted?: (next: T) => void;
  onMove?: (after: Exclude<InlineEditMove, null>) => void;
}

/** Low-level draft and async commit state, shared with table cell editors. */
export function useInlineEdit<T>({
  value,
  editing: controlledEditing,
  defaultEditing = false,
  onEditingChange,
  parse,
  onSave,
  onAccepted,
  onMove,
  genericError,
  focusEditor,
  onCancel,
  validate,
  isEqual = Object.is,
}: UseInlineEditOptions<T>) {
  const [innerEditing, setInnerEditing] = useState(defaultEditing);
  const editing = controlledEditing ?? innerEditing;
  const setEditing = (next: boolean) => {
    if (controlledEditing === undefined) setInnerEditing(next);
    onEditingChange?.(next);
  };
  const [draft, setDraft] = useState(value == null ? '' : String(value));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [previousEditing, setPreviousEditing] = useState(editing);
  if (editing !== previousEditing) {
    setPreviousEditing(editing);
    if (editing) {
      setDraft(value == null ? '' : String(value));
      setError(null);
    }
  }
  const busy = useRef(false);
  const move = useRef<InlineEditMove>(null);
  const notifyMove = useEffectEvent((after: Exclude<InlineEditMove, null>) => onMove?.(after));
  useEffect(() => {
    if (editing || !move.current) return;
    const after = move.current;
    move.current = null;
    notifyMove(after);
  }, [editing]);
  const start = () => {
    setDraft(value == null ? '' : String(value));
    setError(null);
    setEditing(true);
  };
  const finish = (after: InlineEditMove) => {
    move.current = after;
    setError(null);
    setEditing(false);
  };
  const cancel = (after: InlineEditMove = 'self') => {
    setDraft(value == null ? '' : String(value));
    finish(after);
    onCancel?.();
  };
  const commit = async (after: InlineEditMove = 'self') => {
    if (busy.current) return;
    const parsed = parse(draft);
    if (!parsed.ok) {
      setError(parsed.message);
      focusEditor?.();
      return;
    }
    const message = validate?.(parsed.value);
    if (message !== undefined) {
      setError(message);
      focusEditor?.();
      return;
    }
    if (isEqual(parsed.value, value)) {
      finish(after);
      return;
    }
    busy.current = true;
    setPending(true);
    let result: EditableSaveResult;
    try {
      result = await onSave(parsed.value, value);
    } catch (err) {
      result = err instanceof Error && err.message ? err.message : genericError;
    }
    busy.current = false;
    setPending(false);
    if (result === false) result = genericError;
    if (typeof result === 'string') {
      setError(result);
      focusEditor?.(after);
      return;
    }
    setError(null);
    onAccepted?.(parsed.value);
    finish(after);
  };
  return { editing, draft, setDraft, start, cancel, commit, pending, busy, error };
}
