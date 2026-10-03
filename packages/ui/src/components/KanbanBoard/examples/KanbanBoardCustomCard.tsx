import { useState } from 'react';
import { Badge } from '../../Badge';
import { KanbanBoard, moveKanbanCard, type KanbanCard, type KanbanColumn } from '../KanbanBoard';

interface Ticket extends KanbanCard {
  priority: 'High' | 'Normal';
  owner: string;
}

const initial: KanbanColumn<Ticket>[] = [
  {
    id: 'triage',
    title: 'Triage',
    cards: [
      { id: 't1', title: 'Webhook retries stall', priority: 'High', owner: 'Ana' },
      { id: 't2', title: 'Typo on the billing page', priority: 'Normal', owner: 'Luis' },
    ],
  },
  { id: 'fixing', title: 'Fixing', cards: [{ id: 't3', title: 'Slow search on large teams', priority: 'High', owner: 'Mei' }] },
  { id: 'shipped', title: 'Shipped', cards: [] },
];

export default function KanbanBoardCustomCard() {
  const [columns, setColumns] = useState(initial);
  return (
    <KanbanBoard<Ticket>
      label="Support tickets"
      size="sm"
      headingLevel={4}
      emptyText="Drop a fixed ticket here"
      columns={columns}
      onMove={(move) => setColumns((cols) => moveKanbanCard(cols, move))}
      renderCard={(ticket) => (
        <span className="grid gap-2">
          <span className="text-[13px] font-medium leading-5">{ticket.title}</span>
          <span className="flex items-center justify-between gap-2">
            <Badge tone={ticket.priority === 'High' ? 'warning' : 'neutral'}>{ticket.priority}</Badge>
            <span className="font-mono text-[11px] text-muted-foreground">{ticket.owner}</span>
          </span>
        </span>
      )}
    />
  );
}
