import type { TemplateMeta } from '../meta';

export const meta = {
  name: 'Live event stream',
  family: 'Builders',
  priority: 'P3',
  status: 'experimental',
  description: `Controlled subscription form inside FormSection, a visible StatusDot connection indicator, a quiet role=log stream with LogViewer windowing, search, follow-tail and copy, and a pinnable JSON inspector on InspectorLayout. No fetching or transport; no trace waterfall, token cost or timer.

## Props

LiveEventStreamPage accepts Partial<LiveEventStreamProps>; omitted props use generic fixtures.

| Prop | Type | Default / behavior |
| --- | --- | --- |
| title | string | Live event stream; PageHeader h1 |
| description | string | Subscribe to a source and inspect the events it emits. |
| form | ReactNode | Non-sensitive Source field inside FormSection; sensitive fields must use the kit PasswordInput |
| status | idle / connecting / live / error / stopped | idle; fully controlled |
| events | LiveEvent[] | Empty fixture; unique id, timestamp, type, optional summary and unknown payload; oldest first |
| maxEvents | number | 500; nonnegative integer; retains newest entries, evicts oldest; invalid values use 500 |
| eventTypes | string[] | created, updated, deleted; multiple ToggleGroup, initially all enabled; unlisted types remain visible |
| countAnnouncement | string | Omitted; optional count text throttled by the consumer, never inferred from events.length |
| onSubscribe | () => void | Subscribe callback in idle, stopped and error; disabled while connecting |
| onStop | () => void | Stop callback while live |
| onSelectEvent | (event: LiveEvent) => void | Mouse or keyboard selection callback |
| error | string | Generic subscription error; ErrorPanel shown when status=error, inside role=alert |
| validationMessage | string | Omitted; destructive InlineCallout |
| shell | Omit<ConsoleShellProps, 'children'> | ConsoleShell fixture defaults; explicit consumer navigation, workspace, user and topbar slots |

Status mapping: idle = neutral Not subscribed; connecting = info Connecting with pulse; live = success Live with pulse; error = destructive Error; stopped = warning Stopped. Subscribe is shown in idle/connecting/error/stopped and is disabled for connecting; live shows Stop. Idle has No events yet, live-empty has Listening for events, connecting replaces the log with decorative skeletons, and stopped keeps supplied buffered events visible.

## ARIA pattern

PageHeader h1 and labelled FormSection. One polite atomic live region announces connection status and explicit consumer-throttled count text only. LogViewer uses announceLines=false: role=log and aria-live=off; event additions are silent. Connecting uses an aria-busy section. Stream errors use ErrorPanel inside role=alert; validation uses InlineCallout. Inspect buttons have the name Inspect event <timestamp> and aria-pressed. InspectorLayout owns the complementary landmark on desktop, Drawer on small screens, docking, pinning and focus return. Pinning does not freeze the payload: subsequent selection updates it; eviction preserves the last inspected payload with the note This event is no longer in the buffer.

## Keyboard table

| Key | Behavior |
| --- | --- |
| Tab / Shift+Tab | Form fields, Subscribe/Stop, filters, search, Follow, row inspect/copy and panel controls |
| Enter / Space | Activate buttons; select an event; toggle Follow and pinning |
| Arrow keys | Navigate ToggleGroups and the JsonViewer tree |
| Escape | From unpinned panel or toggle, close and return focus to inspector toggle; pinned panel ignores Escape, Close panel closes it |

Follow pins the bottom, where the newest row is added. Scrolling up by more than one row turns Follow off and preserves the viewport offset; switching Follow on returns to the bottom.

## Themes and examples

Dark (default), light and high_contrast use only kit tokens. Connecting/live pulses stop under prefers-reduced-motion. State previews: live-event-stream--connecting, --live-empty, --live-with-events, --error and --stopped. Every state and the default template are covered by axe in all three themes.`,
  layout: 'InspectorLayout',
  blocks: [
    'app-sidebar',
    'app-topbar',
    'page-header',
    'form-section',
    'log-viewer',
    'empty-states',
    'skeletons',
    'inline-callout',
    'error-panel',
  ],
  pattern:
    'PageHeader h1, labelled FormSection, one polite atomic connection live region, quiet role=log stream (aria-live=off), alert errors and complementary JSON inspector. Selected inspect buttons expose aria-pressed.',
  keyboard: [
    ['Tab / Shift+Tab', 'Navigate form, action, filters, search, Follow, row inspect/copy and panel controls.'],
    ['Enter / Space', 'Activate buttons, select an event and toggle Follow or pinning.'],
    ['Arrow keys', 'Navigate ToggleGroups and the JSON tree.'],
    [
      'Escape',
      'Close an unpinned inspector from panel or toggle and return focus to the toggle. Pinned panels ignore Escape.',
    ],
  ],
} satisfies TemplateMeta & { pattern: string; keyboard: [string, string][] };
