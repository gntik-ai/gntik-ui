import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'KanbanBoard',
  group: 'Display',
  status: 'beta',
  description:
    'Columns of cards you reorder within a column and move across columns by pointer drag or keyboard. Controlled (`columns` + `onMove`, with `moveKanbanCard` to apply a move); every pick-up, move, drop and cancel is announced through a LiveAnnouncer. Built on the dependency-free `useSortable` hook (pointer + keyboard, press-and-hold on touch). Cards lift with a border and shadow only; nothing animates under reduced motion. useSortable also exposes getHandleProps(itemId): keep the item ref from getItemProps on the measured element, attach only the handle props to a button, and leave item event handlers off the row for handle-only dragging. Handle buttons support Alt+ArrowUp/ArrowDown for an immediate one-position move; getItemProps keeps its existing keyboard behavior. See the DataTable row-reorder example for a handle-only consumer. Density-aware card padding (`size: "auto"`).',
  pattern:
    'Sortable lists (cards as buttons with aria-roledescription, aria-pressed while moving, aria-describedby instructions) + aria-live announcements',
  keyboard: [
    ['Tab', 'Moves between cards (column by column)'],
    ['Space', 'Picks up the focused card; on a picked-up card, drops it'],
    ['ArrowUp / ArrowDown', 'While moving: one position up / down in the column'],
    ['ArrowLeft / ArrowRight', 'While moving: to the previous / next column (mirrored in RTL)'],
    ['Home / End', 'While moving: to the top / bottom of the column'],
    ['Enter', 'While moving: drops the card; otherwise opens it (`onCardOpen`)'],
    ['Escape', 'While moving: cancels and returns the card to where it started'],
  ],
  tokens: ['secondary', 'card', 'border', 'primary', 'accent', 'foreground', 'muted-foreground', 'focus-ring'],
};
