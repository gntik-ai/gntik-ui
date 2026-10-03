import { PageHeader } from '@gntik-ai/blocks';
import { Plus } from '@gntik-ai/icons';
import {
  Avatar,
  Badge,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  HStack,
  Page,
  SimpleSelect,
  Stack,
  Text,
  Timestamp,
  VisuallyHidden,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { boardBreadcrumbs, boardCards, boardColumns, boardState, locate, priorityLabels, priorityTones, type BoardCard, type BoardColumn, type BoardState } from './data';
import { Lane } from './Lane';
import { useBoard } from './useBoard';

export interface BoardProps {
  title: string;
  description: string;
  columns: BoardColumn[];
  cards: BoardCard[];
  /** Card ids per column id. */
  defaultState: BoardState;
  /** Fires after a drop (pointer, keyboard or the detail drawer's status select). */
  onMove: (cardId: string, toColumn: string, toIndex: number) => void;
  onCreate: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Kanban board: columns with pointer and keyboard drag-and-drop, live announcements and a card detail Drawer. */
export default function BoardPage(props: Partial<BoardProps>) {
  const {
    title = 'Sprint board',
    description = 'Drag cards between columns, or focus a card and press Space to pick it up.',
    columns = boardColumns,
    cards = boardCards,
    defaultState = boardState,
    onMove,
    onCreate,
    breadcrumbs = boardBreadcrumbs,
    currentHref = '/projects',
    shell,
  } = props;
  const board = useBoard({ columns, cards, initial: defaultState, onMove });
  const [openId, setOpenId] = useState<string | null>(null);
  const ids = useId();
  const byId = new Map(cards.map((c) => [c.id, c]));
  const open = openId ? byId.get(openId) : undefined;
  const openAt = openId ? locate(board.state, openId) : null;

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="full"
        header={
          <PageHeader breadcrumbs={null} title={title} description={description} status="" meta={[]} tabs={null} actions={[{ label: 'New card', icon: Plus, onClick: onCreate }]} />
        }
      >
        <VisuallyHidden id={`${ids}-help`}>Press Space to pick up the card, arrow keys to move it, Space to drop and Escape to cancel. Enter opens the details.</VisuallyHidden>
        <VisuallyHidden aria-live="assertive" aria-atomic="true">
          {board.announcement}
        </VisuallyHidden>
        <div role="group" aria-label="Board" className="flex gap-4 overflow-x-auto pb-2">
          {columns.map((col) => (
            <Lane
              key={col.id}
              column={col}
              cards={(board.state[col.id] ?? []).flatMap((id) => byId.get(id) ?? [])}
              headingId={`${ids}-${col.id}`}
              instructionsId={`${ids}-help`}
              grabbedId={board.grabbedId}
              draggingId={board.dragging}
              isDropTarget={board.dropColumn === col.id}
              register={board.register}
              onOpen={setOpenId}
              onCardKeyDown={board.onCardKeyDown}
              onCardKeyUp={board.onCardKeyUp}
              onDragStart={board.onDragStart}
              onDragEnd={board.onDragEnd}
              onDragOver={board.onColumnDragOver(col.id)}
              onDrop={board.onColumnDrop(col.id)}
            />
          ))}
        </div>
      </Page>
      <Drawer open={open != null} onOpenChange={(next) => !next && setOpenId(null)}>
        <DrawerContent size="md">
          {open && (
            <>
              <DrawerHeader>
                <DrawerTitle>{open.title}</DrawerTitle>
                <DrawerDescription>{open.id}</DrawerDescription>
              </DrawerHeader>
              <DrawerBody>
                <Stack gap={5}>
                  <HStack gap={2} wrap>
                    <Badge tone={priorityTones[open.priority]}>{priorityLabels[open.priority]} priority</Badge>
                    {open.labels.map((l) => (
                      <Badge key={l} variant="outline">
                        {l}
                      </Badge>
                    ))}
                  </HStack>
                  <Text variant="supporting">{open.description}</Text>
                  <dl className="grid grid-cols-[7rem_1fr] items-center gap-x-4 gap-y-3 text-[13px]">
                    <dt className="text-muted-foreground">Status</dt>
                    <dd>
                      <SimpleSelect
                        aria-label="Status"
                        size="sm"
                        items={columns.map((c) => ({ value: c.id, label: c.title }))}
                        value={openAt?.column ?? null}
                        onValueChange={(v) => v && board.moveTo(open.id, v, board.state[v]?.length ?? 0)}
                        className="w-44"
                      />
                    </dd>
                    <dt className="text-muted-foreground">Assignee</dt>
                    <dd className="flex items-center gap-2 text-foreground">
                      <Avatar size="xs" name={open.assignee} aria-hidden />
                      {open.assignee}
                    </dd>
                    <dt className="text-muted-foreground">Due</dt>
                    <dd className="text-foreground">{open.due ? <Timestamp value={open.due} format="absolute" tooltip={false} dateOptions={{ dateStyle: 'medium' }} /> : 'No due date'}</dd>
                  </dl>
                </Stack>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </ConsoleShell>
  );
}
