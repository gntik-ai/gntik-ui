/** Generic, transport-free subscription fixture. */
export const streamTitle = 'Live event stream';
export const streamDescription = 'Subscribe to a source and inspect the events it emits.';
export const streamSource = 'activity';

export interface LiveEvent {
  /** Stable, unique event identity. */
  id: string;
  /** Consumer-formatted display timestamp. */
  timestamp: string;
  /** Event type used for filtering. */
  type: string;
  /** Optional concise row text; defaults to the event type. */
  summary?: string;
  /** Inspected only on selection; never serialised into log lines. */
  payload: unknown;
}

export const emptyStreamEvents: LiveEvent[] = [];
export const streamEventTypes = ['created', 'updated', 'deleted'];

export const streamEvents: LiveEvent[] = [
  {
    id: 'event-1',
    timestamp: '12:04:30.000',
    type: 'created',
    summary: 'Record created',
    payload: { id: 'record-42', name: 'Sample record', revision: 1 },
  },
  {
    id: 'event-2',
    timestamp: '12:04:31.000',
    type: 'updated',
    summary: 'Record updated',
    payload: { id: 'record-42', name: 'Updated record', revision: 2 },
  },
  {
    id: 'event-3',
    timestamp: '12:04:32.000',
    type: 'deleted',
    summary: 'Record deleted',
    payload: { id: 'record-42', revision: 2 },
  },
];
