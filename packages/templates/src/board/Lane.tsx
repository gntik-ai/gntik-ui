import { CalendarClock, GripVertical } from '@gntik-ai/icons';
import { Avatar, Badge, cn, Timestamp } from '@gntik-ai/ui';
import type { DragEvent, KeyboardEvent } from 'react';
import { priorityLabels, priorityTones, type BoardCard, type BoardColumn } from './data';

export interface LaneProps {
  column: BoardColumn;
  cards: BoardCard[];
  headingId: string;
  instructionsId: string;
  grabbedId: string | null;
  draggingId: string | null;
  isDropTarget: boolean;
  register: (id: string) => (el: HTMLButtonElement | null) => void;
  onOpen: (id: string) => void;
  onCardKeyDown: (id: string) => (e: KeyboardEvent<HTMLButtonElement>) => void;
  onCardKeyUp: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onDragStart: (id: string) => (e: DragEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent<HTMLElement>) => void;
  onDrop: (e: DragEvent<HTMLElement>) => void;
}

/** One board column: heading with count and a list of draggable card buttons. */
export function Lane({
  column,
  cards,
  headingId,
  instructionsId,
  grabbedId,
  draggingId,
  isDropTarget,
  register,
  onOpen,
  onCardKeyDown,
  onCardKeyUp,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: LaneProps) {
  return (
    <section
      aria-labelledby={headingId}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-drop-target={isDropTarget || undefined}
      className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-secondary/40 data-[drop-target]:border-primary/60 data-[drop-target]:bg-accent/40"
    >
      <h2 id={headingId} className="flex items-center gap-2 px-3.5 pt-3 pb-2 text-[13px] font-semibold text-foreground">
        {column.title}
        <span className="font-mono text-[11px] font-normal text-muted-foreground">
          {cards.length}
          <span className="sr-only"> cards</span>
        </span>
      </h2>
      <ul className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
        {cards.map((card, index) => (
          <li key={card.id} data-card-index={index}>
            <button
              ref={register(card.id)}
              type="button"
              draggable
              aria-describedby={instructionsId}
              aria-pressed={grabbedId === card.id}
              onClick={() => onOpen(card.id)}
              onKeyDown={onCardKeyDown(card.id)}
              onKeyUp={onCardKeyUp}
              onDragStart={onDragStart(card.id)}
              onDragEnd={onDragEnd}
              className={cn(
                'group flex w-full cursor-grab flex-col gap-2 rounded-lg border border-border bg-card p-3 text-start shadow-sm transition-colors motion-reduce:transition-none hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                'aria-pressed:border-primary aria-pressed:bg-accent',
                draggingId === card.id && 'opacity-50',
              )}
            >
              <span className="flex items-start gap-2">
                <span className="min-w-0 flex-1 text-[13px] leading-snug font-medium text-foreground">{card.title}</span>
                <GripVertical size={14} aria-hidden className="mt-0.5 shrink-0 text-muted-foreground" />
              </span>
              <span className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] text-muted-foreground">{card.id}</span>
                <Badge size="sm" tone={priorityTones[card.priority]}>
                  {priorityLabels[card.priority]}
                </Badge>
                {card.labels.map((l) => (
                  <Badge key={l} size="sm" variant="outline">
                    {l}
                  </Badge>
                ))}
              </span>
              <span className="flex items-center justify-between gap-2 text-[11.5px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {card.due && (
                    <>
                      <CalendarClock size={12} aria-hidden />
                      <span className="sr-only">Due </span>
                      <Timestamp value={card.due} format="absolute" tooltip={false} dateOptions={{ month: 'short', day: 'numeric' }} />
                    </>
                  )}
                </span>
                <Avatar size="xs" name={card.assignee} />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
