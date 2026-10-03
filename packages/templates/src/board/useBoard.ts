import { useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { flushSync } from 'react-dom';
import { locate, moveCard, type BoardCard, type BoardColumn, type BoardState } from './data';

export interface UseBoardOptions {
  columns: readonly BoardColumn[];
  cards: readonly BoardCard[];
  initial: BoardState;
  onMove?: (cardId: string, toColumn: string, toIndex: number) => void;
}

interface Grab {
  id: string;
  origin: { column: string; index: number };
}

/**
 * Board state with both drag paths: pointer (HTML drag and drop onto a column or before a card)
 * and keyboard (Space picks up, arrows move, Space or Enter drops, Escape cancels). Every step is
 * announced through `announcement`, and focus follows the moved card.
 */
export function useBoard({ columns, cards, initial, onMove }: UseBoardOptions) {
  const [state, setState] = useState<BoardState>(initial);
  const [grab, setGrab] = useState<Grab | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dropColumn, setDropColumn] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  const titleOf = (id: string) => cards.find((c) => c.id === id)?.title ?? id;
  const columnTitle = (id: string) => columns.find((c) => c.id === id)?.title ?? id;
  const where = (s: BoardState, column: string, index: number) => `${columnTitle(column)}, position ${index + 1} of ${s[column]?.length ?? 0}`;

  const register = (id: string) => (el: HTMLButtonElement | null) => {
    if (el) buttons.current.set(id, el);
    else buttons.current.delete(id);
  };

  /** Moves synchronously so the remounted card can take focus right away. */
  const commit = (id: string, column: string, index: number) => {
    const next = moveCard(state, id, column, index);
    flushSync(() => setState(next));
    buttons.current.get(id)?.focus();
    return next;
  };

  const moveTo = (id: string, column: string, index: number, announce = true) => {
    const next = commit(id, column, index);
    const at = locate(next, id);
    if (at) {
      if (announce) setAnnouncement(`Dropped ${titleOf(id)} in ${where(next, at.column, at.index)}.`);
      onMove?.(id, at.column, at.index);
    }
  };

  const onCardKeyDown = (id: string) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const at = locate(state, id);
    if (!at) return;
    const held = grab?.id === id;
    if (e.key === ' ' || (held && e.key === 'Enter')) {
      e.preventDefault();
      if (held) {
        setGrab(null);
        setAnnouncement(`Dropped ${titleOf(id)} in ${where(state, at.column, at.index)}.`);
        onMove?.(id, at.column, at.index);
      } else {
        setGrab({ id, origin: at });
        setAnnouncement(`Picked up ${titleOf(id)} in ${where(state, at.column, at.index)}. Use the arrow keys to move, Space to drop, Escape to cancel.`);
      }
      return;
    }
    if (!held) return;
    const colIndex = columns.findIndex((c) => c.id === at.column);
    let target: { column: string; index: number } | null = null;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const nextCol = columns[colIndex + (e.key === 'ArrowRight' ? 1 : -1)];
      if (nextCol) target = { column: nextCol.id, index: Math.min(at.index, state[nextCol.id]?.length ?? 0) };
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const index = at.index + (e.key === 'ArrowDown' ? 1 : -1);
      if (index >= 0 && index < (state[at.column]?.length ?? 0)) target = { column: at.column, index };
    } else if (e.key === 'Escape' && grab) {
      e.preventDefault();
      const next = commit(id, grab.origin.column, grab.origin.index);
      setGrab(null);
      setAnnouncement(`Cancelled. ${titleOf(id)} returned to ${where(next, grab.origin.column, grab.origin.index)}.`);
      return;
    }
    if (!target) return;
    e.preventDefault();
    const next = commit(id, target.column, target.index);
    const now = locate(next, id);
    if (now) setAnnouncement(`Moved to ${where(next, now.column, now.index)}.`);
  };

  /** Space activates buttons on keyup; cancel it so picking up does not open the card. */
  const onCardKeyUp = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ') e.preventDefault();
  };

  const onDragStart = (id: string) => (e: DragEvent<HTMLElement>) => {
    e.dataTransfer?.setData('text/plain', id);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    setDragging(id);
  };
  const onDragEnd = () => {
    setDragging(null);
    setDropColumn(null);
  };
  const onColumnDragOver = (column: string) => (e: DragEvent<HTMLElement>) => {
    if (!dragging) return;
    e.preventDefault();
    if (dropColumn !== column) setDropColumn(column);
  };
  const onColumnDrop = (column: string) => (e: DragEvent<HTMLElement>) => {
    if (!dragging) return;
    e.preventDefault();
    const before = (e.target as HTMLElement).closest<HTMLElement>('[data-card-index]');
    const from = locate(state, dragging);
    let index = before ? Number(before.dataset.cardIndex) : (state[column]?.length ?? 0);
    // Dropping before a later card of the same column: the card leaves its slot first.
    if (from && from.column === column && from.index < index) index -= 1;
    const id = dragging;
    setDragging(null);
    setDropColumn(null);
    moveTo(id, column, index);
  };

  return {
    state,
    grabbedId: grab?.id ?? null,
    dragging,
    dropColumn,
    announcement,
    register,
    moveTo,
    onCardKeyDown,
    onCardKeyUp,
    onDragStart,
    onDragEnd,
    onColumnDragOver,
    onColumnDrop,
  };
}
