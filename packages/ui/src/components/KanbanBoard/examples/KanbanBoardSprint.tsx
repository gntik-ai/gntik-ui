import { useState } from 'react';
import { KanbanBoard, moveKanbanCard, type KanbanColumn } from '../KanbanBoard';

const initial: KanbanColumn[] = [
  {
    id: 'todo',
    title: 'To do',
    cards: [
      { id: 'c1', title: 'Rotate API keys', description: 'Staging and production', meta: 'Due Fri' },
      { id: 'c2', title: 'Write the migration guide', meta: '2 points' },
      { id: 'c3', title: 'Audit role permissions' },
    ],
  },
  {
    id: 'doing',
    title: 'In progress',
    cards: [{ id: 'c4', title: 'Usage export to CSV', description: 'Streams rows, no row limit', meta: '3 points' }],
  },
  { id: 'review', title: 'Review', cards: [] },
  { id: 'done', title: 'Done', cards: [{ id: 'c5', title: 'Fix the invite email link' }] },
];

export default function KanbanBoardSprint() {
  const [columns, setColumns] = useState(initial);
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="grid gap-3">
      <KanbanBoard
        label="Sprint board"
        columns={columns}
        onMove={(move) => setColumns((cols) => moveKanbanCard(cols, move))}
        onCardOpen={(card) => setOpened(card.title)}
      />
      <p className="h-4 font-mono text-[11px] text-muted-foreground">{opened ? `Opened: ${opened}` : 'Drag a card, or focus one and press Space.'}</p>
    </div>
  );
}
