import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'AgentSurface',
  group: 'Display',
  status: 'beta',
  description:
    'Opt-in, placement-neutral renderer for allow-listed agent content. Accepts only A2UI v0.9 command envelopes (A2UI_VERSION). Pass an immutable messages log and a trusted catalog; append createSurface, updateComponents, updateDataModel and deleteSurface messages. Component records have id, component, optional children (child ids), and flat catalog properties; the root id is "root". Text/Heading/Badge use text; Text optionally accepts href; Heading accepts level 1–6. Card contains children; Stack accepts direction (row/column) and gap (0–12). Button uses label, optional disabled and action { name, context }; Input uses label, optional text value/disabled and only type text. Select uses label, options [{ value, label }], optional value/disabled; Checkbox uses label, optional checked/disabled. Alert uses title and optional text. { path: "/user/name" } reads a JSON Pointer; Input/Select value and Checkbox checked write back to that path. updateDataModel { surfaceId, path?, value } replaces the value at path (default: model root). Every default Button is a submit control: Enter in an Input can activate the first Button, so keep a safe primary action first and avoid destructive actions in that position. Buttons, keyboard activation and implicit form submission emit onAction { name, surfaceId, context } with the current bound values. Replacing the log replays it; keep existing message objects stable when appending. Runtime validation rejects unsupported versions, malformed JSON, prototype keys, cycles, shared children and excessive trees (256 nodes, depth 32, 32 surfaces). Missing child definitions may arrive later. Unknown components and invalid properties show a localized placeholder and report a deduplicated onError diagnostic. The visible, accessible agent-content frame cannot be relabelled by the agent. Deletion or version suppression of rendered content restores focus to the next surviving sibling control, the first focusable textarea in the document, or the labelled container. Place the chat composer as that first textarea or provide a focusable sibling after the renderer; another textarea can otherwise receive focus. defineAgentCatalog accepts trusted host wrappers { component, validate }; validate must return a fresh allow-list of known properties or null. Wrappers receive { props, children, onValueChange, onAction } and must assign explicit kit props. Never spread agent data into elements. Custom URL properties must have names ending in href, src or url (case-insensitive) to receive the Markdown safeUrl policy; text renders as React text nodes. Custom catalogs can reintroduce phishing and executable content: audit their wrappers and validators, never allow passwords, payments, file uploads, arbitrary markup or host-chrome styling. Transport, side-panel placement, v0.8 adapters and Markdown integration belong to consumers or future changes. The live example demonstrates every default entry, model patches, actions, rejection, deletion and reset.',
  primitive: 'Kit components (Base UI)',
  pattern: 'labelled group containing a form',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves between enabled form controls and links'],
    ['Enter / Space', 'Activates a Button exactly once; Enter in an Input submits with the first Button'],
    ['Space', 'Toggles a Checkbox and updates its bound model path'],
    ['Enter / ArrowDown', 'Opens a Select; ArrowUp/ArrowDown navigates options'],
    ['Enter / Escape', 'Selects an option / closes a Select and returns focus'],
    ['Surface deletion', 'Moves focus to a surviving sibling control, the composer, or the labelled container'],
  ],
  tokens: ['background', 'card', 'border', 'foreground', 'muted-foreground', 'focus-ring'],
};
