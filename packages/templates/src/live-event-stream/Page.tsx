import {
  ErrorPanel,
  FormSection,
  InlineCallout,
  ListSkeleton,
  LogViewer,
  PageHeader,
  type LogLine,
} from '@gntik-ai/blocks';
import {
  Button,
  EmptyState,
  Field,
  FieldLabel,
  HStack,
  Input,
  InspectorLayout,
  InspectorToggle,
  JsonViewer,
  Page,
  StatusDot,
  Toggle,
  ToggleGroup,
  useInspectorLayout,
} from '@gntik-ai/ui';
import { useMemo, useState, type ReactNode } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  emptyStreamEvents,
  streamDescription,
  streamEventTypes,
  streamSource,
  streamTitle,
  type LiveEvent,
} from './data';

export type { LiveEvent } from './data';

export type LiveEventStreamStatus = 'idle' | 'connecting' | 'live' | 'error' | 'stopped';

const CONNECTION = {
  idle: { label: 'Not subscribed', tone: 'neutral', pulse: false },
  connecting: { label: 'Connecting', tone: 'info', pulse: true },
  live: { label: 'Live', tone: 'success', pulse: true },
  error: { label: 'Error', tone: 'destructive', pulse: false },
  stopped: { label: 'Stopped', tone: 'warning', pulse: false },
} as const;

/**
 * Controlled subscription form, quiet windowed stream and pinnable JSON inspector.
 * LiveEventStreamPage accepts Partial<LiveEventStreamProps>; omitted props use fixtures.
 * No fetching, transport or subscription lifecycle is implemented here. Events must have
 * unique ids and arrive oldest first. The newest maxEvents entries are retained.
 *
 * @remarks
 * ARIA: one PageHeader h1; labelled FormSection; visible StatusDot text; a single polite,
 * atomic connection status region. Only status changes and explicit consumer-throttled
 * countAnnouncement updates change that region, never events.length. LogViewer uses
 * announceLines=false (role=log, aria-live=off). Connecting replaces the log with decorative
 * skeletons in an aria-busy section. ErrorPanel is wrapped in role=alert; validation uses
 * InlineCallout. InspectorLayout supplies the complementary panel on desktop and a Drawer
 * on small screens. Selection exposes aria-pressed on the row's inspect button.
 * Pinning docks the panel without freezing selection. Eviction retains the last inspected
 * payload and displays "This event is no longer in the buffer."
 *
 * Keyboard table:
 * | Key | Behavior |
 * | --- | --- |
 * | Tab / Shift+Tab | Move through form, action, filters, search, Follow, inspect and copy. |
 * | Enter / Space | Activate buttons, select an event, toggle Follow or pinning. |
 * | Arrow keys | Navigate event-type and log-level ToggleGroups and the JSON tree. |
 * | Escape | Close an unpinned inspector from its panel or toggle; return focus to the toggle. Pinned panels ignore Escape; use Close panel. |
 * Scrolling up more than one row disables Follow and preserves the scroll offset.
 * Enabling Follow pins the viewport to the bottom, where new events are appended.
 *
 * Themes: dark (default), light and high_contrast use only kit tokens. StatusDot pulses
 * for connecting/live are disabled by prefers-reduced-motion. Sensitive fields in form
 * must use the kit PasswordInput; the fixture contains only a non-sensitive Source field.
 */
export interface LiveEventStreamProps {
  /** PageHeader h1. */
  title: string;
  /** Supporting text below the page title. */
  description: string;
  /** Consumer's subscription fields. Sensitive fields must use the kit PasswordInput. */
  form: ReactNode;
  /** Controlled connection state; defaults to idle. No transport is started by the template. */
  status: LiveEventStreamStatus;
  /** Controlled events in arrival order, oldest first. Defaults to the empty fixture. */
  events: LiveEvent[];
  /** Newest events retained (default 500). Nonnegative integers; invalid values use 500. */
  maxEvents: number;
  /** Type toggles, initially all enabled. Unlisted types remain visible. Defaults to fixture types. */
  eventTypes: string[];
  /** Optional consumer-throttled count text. Never inferred from events.length. */
  countAnnouncement: string;
  /** Called by Subscribe in idle, stopped or error. */
  onSubscribe: () => void;
  /** Called by Stop while live. */
  onStop: () => void;
  /** Called with the selected event after mouse or keyboard inspection. */
  onSelectEvent: (event: LiveEvent) => void;
  /** Stream error summary, shown in an ErrorPanel with role=alert when status is error. */
  error: string;
  /** Form validation feedback, shown in a destructive InlineCallout. */
  validationMessage: string;
  /** Explicit console navigation, workspace, user and topbar slots. */
  shell: Omit<ConsoleShellProps, 'children'>;
}

function EventLog({
  lines,
  selectedLineId,
  onSelectLine,
}: {
  lines: LogLine[];
  selectedLineId?: string;
  onSelectLine: (line: LogLine) => void;
}) {
  const { setOpen, panelId, docked, pinned } = useInspectorLayout();
  return (
    <LogViewer
      title="Events"
      titleAs="h2"
      lines={lines}
      announceLines={false}
      selectedLineId={selectedLineId}
      onSelectLine={(line) => {
        onSelectLine(line);
        setOpen(true);
        if (docked && !pinned) requestAnimationFrame(() => document.getElementById(panelId)?.focus());
      }}
    />
  );
}

export default function LiveEventStreamPage({
  title = streamTitle,
  description = streamDescription,
  form = (
    <Field>
      <FieldLabel>Source</FieldLabel>
      <Input defaultValue={streamSource} />
    </Field>
  ),
  shell,
  status = 'idle',
  onSubscribe,
  onStop,
  onSelectEvent,
  error = 'The subscription failed. Check the parameters and try again.',
  validationMessage,
  events = emptyStreamEvents,
  maxEvents = 500,
  eventTypes = streamEventTypes,
  countAnnouncement,
}: Partial<LiveEventStreamProps>) {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [excludedTypes, setExcludedTypes] = useState<string[]>([]);
  const [selected, setSelected] = useState<LiveEvent | null>(null);
  const connection = CONNECTION[status];
  const limit = Number.isInteger(maxEvents) && maxEvents >= 0 ? maxEvents : 500;
  const buffer = useMemo(() => events.slice(Math.max(0, events.length - limit)), [events, limit]);
  const eventsById = useMemo(() => new Map(buffer.map((event) => [event.id, event])), [buffer]);
  const lines = useMemo<LogLine[]>(
    () =>
      buffer
        .filter((event) => !excludedTypes.includes(event.type))
        .map((event) => ({
          id: event.id,
          timestamp: event.timestamp,
          level: 'info',
          source: event.type,
          message: event.summary ?? event.type,
        })),
    [buffer, excludedTypes],
  );
  return (
    <ConsoleShell {...shell}>
      <InspectorLayout
        open={inspectorOpen}
        onOpenChange={setInspectorOpen}
        defaultPinned={false}
        panelTitle="Event inspector"
        panel={
          selected ? (
            <>
              <JsonViewer
                key={selected.id}
                data={selected.payload}
                label="Event payload"
                defaultExpandDepth={2}
                toolbar={false}
              />
              {!eventsById.has(selected.id) && (
                <p className="mt-4 text-sm text-muted-foreground">This event is no longer in the buffer.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select an event to inspect its payload.</p>
          )
        }
      >
        <Page
          width="wide"
          header={
            <PageHeader
              title={title}
              description={description}
              breadcrumbs={null}
              status=""
              meta={[]}
              tabs={null}
              actions={[]}
            />
          }
        >
          <FormSection
            title="Subscription parameters"
            description="Choose the source to subscribe to."
            actions={
              <Button disabled={status === 'connecting'} onClick={status === 'live' ? onStop : onSubscribe}>
                {status === 'live' ? 'Stop' : 'Subscribe'}
              </Button>
            }
          >
            {form}
          </FormSection>
          {validationMessage && (
            <InlineCallout
              tone="destructive"
              title="Check subscription parameters"
              description={validationMessage}
              actions={[]}
            />
          )}
          <HStack justify="between">
            <StatusDot {...connection} />
            <InspectorToggle label="Toggle event inspector" />
          </HStack>
          <p className="text-sm text-muted-foreground">
            {buffer.length} of {events.length} events buffered
          </p>
          {eventTypes.length > 0 && (
            <ToggleGroup
              aria-label="Event types"
              multiple
              value={eventTypes.filter((type) => !excludedTypes.includes(type))}
              onValueChange={(value) => setExcludedTypes(eventTypes.filter((type) => !value.includes(type)))}
            >
              {eventTypes.map((type) => (
                <Toggle key={type} value={type}>
                  {type}
                </Toggle>
              ))}
            </ToggleGroup>
          )}
          <p role="status" aria-label="Connection status" aria-live="polite" aria-atomic="true" className="sr-only">
            {connection.label}
            {countAnnouncement ? `. ${countAnnouncement}` : ''}
          </p>
          {status === 'error' && (
            <div role="alert" aria-label="Subscription error">
              <ErrorPanel
                title="Subscription error"
                message={error}
                code={null}
                requestId=""
                details=""
                secondaryAction={null}
                titleAs="h2"
              />
            </div>
          )}
          {status === 'connecting' ? (
            <section aria-label="Events" aria-busy="true">
              <div aria-hidden="true">
                <ListSkeleton rows={5} label="Connecting" />
              </div>
            </section>
          ) : buffer.length > 0 ? (
            <EventLog
              lines={lines}
              selectedLineId={selected?.id}
              onSelectLine={(line) => {
                const event = eventsById.get(line.id);
                if (!event) return;
                setSelected(event);
                onSelectEvent?.(event);
              }}
            />
          ) : (
            <div role="log" aria-label="Events" aria-live="off">
              <EmptyState
                titleAs="h2"
                title={status === 'live' ? 'Listening for events' : 'No events yet'}
                description={
                  status === 'live' ? 'New events will appear here.' : 'Subscribe to start receiving events.'
                }
              />
            </div>
          )}
        </Page>
      </InspectorLayout>
    </ConsoleShell>
  );
}
