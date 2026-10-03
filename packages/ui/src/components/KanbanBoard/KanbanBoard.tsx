import { createElement, useId, useMemo, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { useI18n } from '../../i18n/I18nProvider';
import { LiveAnnouncer, useAnnounce, useHasLiveAnnouncer } from '../LiveAnnouncer';
import { kanbanBoardVariants, type KanbanBoardVariantProps } from './kanban-board.variants';
import { useSortable, type SortableContainer, type SortableDrag } from './useSortable';

/** The default card shape. Extend it with your own fields and pass `renderCard`. */
export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  /** Small line under the card (assignee, due date, labels…). Keep it non-interactive. */
  meta?: ReactNode;
}

export interface KanbanColumn<T extends KanbanCard = KanbanCard> {
  id: string;
  title: string;
  cards: T[];
}

/** A committed move. `toIndex` is the index in the destination column once the card left its origin. */
export interface KanbanMove {
  cardId: string;
  fromColumnId: string;
  fromIndex: number;
  toColumnId: string;
  toIndex: number;
}

export interface KanbanBoardProps<T extends KanbanCard = KanbanCard> extends KanbanBoardVariantProps {
  /** Controlled columns and cards. Apply `onMove` to them (see `moveKanbanCard`). */
  columns: KanbanColumn<T>[];
  /** Called on drop when a card lands somewhere new (pointer or keyboard). */
  onMove: (move: KanbanMove) => void;
  /** Card body. Default: title, description and meta. Must not contain interactive elements. */
  renderCard?: (card: T, state: { dragging: boolean }) => ReactNode;
  /** Plain-text name of a card for announcements. Default: `title`. */
  getCardLabel?: (card: T) => string;
  /** Click or Enter on a card (when not moving it), e.g. to open its details. */
  onCardOpen?: (card: T) => void;
  /** Accessible name of the board. Default "Board". */
  label?: string;
  /** Level of the column headings. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Text in an empty column. Default "No cards". */
  emptyText?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** Applies a KanbanMove to the columns (immutably). Use it in your `onMove` handler. */
export function moveKanbanCard<T extends KanbanCard>(columns: KanbanColumn<T>[], move: KanbanMove): KanbanColumn<T>[] {
  const card = columns.find((c) => c.id === move.fromColumnId)?.cards.find((c) => c.id === move.cardId);
  if (!card) return columns;
  const without = columns.map((c) => (c.id === move.fromColumnId ? { ...c, cards: c.cards.filter((x) => x.id !== move.cardId) } : c));
  return without.map((c) => {
    if (c.id !== move.toColumnId) return c;
    const cards = [...c.cards];
    cards.splice(Math.min(Math.max(move.toIndex, 0), cards.length), 0, card);
    return { ...c, cards };
  });
}

const s = kanbanBoardVariants;

function DefaultCard({ card, slots }: { card: KanbanCard; slots: ReturnType<typeof kanbanBoardVariants> }) {
  return (
    <>
      <span className={cn('block', slots.cardTitle())}>{card.title}</span>
      {card.description && <span className={cn('block', slots.cardDescription())}>{card.description}</span>}
      {card.meta != null && <span className={slots.cardMeta()}>{card.meta}</span>}
    </>
  );
}

function Board<T extends KanbanCard>({
  columns,
  onMove,
  renderCard,
  getCardLabel = (card) => card.title,
  onCardOpen,
  label,
  headingLevel = 3,
  emptyText,
  disabled = false,
  size,
  className,
}: KanbanBoardProps<T>) {
  const { t } = useI18n();
  const announce = useAnnounce();
  const id = useId();
  const slots = s({ size });
  const containers = useMemo<SortableContainer[]>(() => columns.map((c) => ({ id: c.id, items: c.cards.map((card) => card.id) })), [columns]);
  const cardById = useMemo(() => new Map(columns.flatMap((c) => c.cards.map((card) => [card.id, card] as const))), [columns]);
  const columnById = useMemo(() => new Map(columns.map((c) => [c.id, c] as const)), [columns]);

  const describe = (drag: SortableDrag, key: 'kanban.pickedUp' | 'kanban.moved' | 'kanban.dropped') => {
    const card = cardById.get(drag.itemId);
    const column = columnById.get(drag.over.containerId);
    const others = column ? column.cards.filter((c) => c.id !== drag.itemId).length : 0;
    return t(key, {
      card: card ? getCardLabel(card) : drag.itemId,
      position: drag.over.index + 1,
      total: others + 1,
      column: column?.title ?? drag.over.containerId,
    });
  };

  const sortable = useSortable({
    containers,
    disabled,
    onMove: (m) => onMove({ cardId: m.itemId, fromColumnId: m.fromContainerId, fromIndex: m.fromIndex, toColumnId: m.toContainerId, toIndex: m.toIndex }),
    onDragStart: (drag) => announce(describe(drag, 'kanban.pickedUp')),
    onDragOver: (drag) => announce(describe(drag, 'kanban.moved')),
    onDragEnd: (drag) => announce(describe(drag, 'kanban.dropped')),
    onDragCancel: (drag) => {
      const card = cardById.get(drag.itemId);
      announce(t('kanban.cancelled', { card: card ? getCardLabel(card) : drag.itemId, column: columnById.get(drag.origin.containerId)?.title ?? drag.origin.containerId }));
    },
  });

  const instructionsId = `${id}-instructions`;
  return (
    <div role="group" aria-label={label ?? t('kanban.label')} className={cn(slots.root(), className)}>
      <p id={instructionsId} hidden>
        {t('kanban.instructions')}
      </p>
      {sortable.containers.map((list) => {
        const column = columnById.get(list.id);
        if (!column) return null;
        const headingId = `${id}-${list.id}`;
        const count = list.items.length;
        return (
          <section key={list.id} aria-labelledby={headingId} className={slots.column()} {...sortable.getContainerProps(list.id)}>
            <div className={slots.header()}>
              {createElement(
                `h${headingLevel}`,
                { id: headingId, className: slots.heading() },
                <span className={slots.title()}>{column.title}</span>,
                <span className={slots.count()}>
                  <span aria-hidden>{count}</span>
                  <span className="sr-only">{`, ${t('kanban.cards', { count })}`}</span>
                </span>,
              )}
            </div>
            <ul className={slots.list()}>
              {list.items.map((cardId) => {
                const card = cardById.get(cardId);
                if (!card) return null;
                const itemProps = sortable.getItemProps(cardId);
                const dragging = sortable.drag?.itemId === cardId;
                return (
                  <li key={cardId} className={slots.item()}>
                    <div
                      role="button"
                      tabIndex={disabled ? -1 : 0}
                      aria-roledescription={t('kanban.roleDescription')}
                      aria-describedby={instructionsId}
                      aria-disabled={disabled || undefined}
                      className={slots.card()}
                      {...itemProps}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !sortable.drag && e.target === e.currentTarget) {
                          e.preventDefault();
                          onCardOpen?.(card);
                          return;
                        }
                        itemProps.onKeyDown(e);
                      }}
                      onClick={() => onCardOpen?.(card)}
                    >
                      {renderCard ? renderCard(card, { dragging }) : <DefaultCard card={card} slots={slots} />}
                    </div>
                  </li>
                );
              })}
              {list.items.length === 0 && <li className={slots.empty()}>{emptyText ?? t('kanban.empty')}</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/**
 * Kanban board: columns of cards you reorder within a column and move across columns, by
 * pointer drag or keyboard (Space picks up, arrows move, Space drops, Escape cancels). Each
 * step is announced through a LiveAnnouncer (its own, unless one is already above). Controlled:
 * render `columns`, apply `onMove`.
 */
export function KanbanBoard<T extends KanbanCard = KanbanCard>(props: KanbanBoardProps<T>) {
  const hasAnnouncer = useHasLiveAnnouncer();
  if (hasAnnouncer) return <Board {...props} />;
  return (
    <LiveAnnouncer>
      <Board {...props} />
    </LiveAnnouncer>
  );
}
