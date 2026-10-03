# Component spec: `<Name>`

> Copy this file to the PR description (or `docs/specs/<name>.md` for larger pieces) before
> writing code. Keep it short: one screen. Delete the hints in italics.

| | |
| --- | --- |
| **Status on merge** | lab · beta · stable |
| **Group** | Actions · Forms · Overlays · Navigation · Display · Feedback · Layout · Theme |
| **Package** | `@gntik-ai/ui` · `blocks` · `templates` · `chat` · `charts` · `flow` · `editor` |
| **Owner** | @handle |
| **Tracking issue** | #000 |

## Problem

_Which product need does this solve? Name at least two consumers (apps, blocks or templates)
— a component used once belongs in the app, not in the kit. No product names in the API._

## Prior art

_Existing kit pieces that come close and why they don't fit. Legacy catalog section
(`apps/docs/src/catalog/*.jsx`) it ports, if any. Base UI primitive it builds on
(`@base-ui/react/<part>`) and the WAI-ARIA pattern._

## API

```tsx
<Name variant="default" size="md" onValueChange={…}>
  <Name.Part />
</Name>
```

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `variant` | `'default' \| '…'` | `'default'` | |
| `className` | `string` | — | merged with `cn()` |

_Controlled + uncontrolled where state exists (`value`/`defaultValue`/`onValueChange`).
Compound parts over render props. No boolean props that should be a variant._

## Anatomy and tokens

_Slots (`name.variants.ts`) and the tokens each reads: surfaces (`bg-card`, `bg-popover`),
text (`text-foreground`, `text-muted-foreground`, `text-*-text` aliases), borders, radius,
shadow, motion (`duration-*`, `ease-*`). No new tokens without a token proposal._

## States

_Default, hover, focus-visible, active, disabled, loading, empty, error, open/closed,
selected — whichever apply. Each one in light, dark and high_contrast._

## Accessibility

| Key | Behaviour |
| --- | --- |
| `Tab` | |
| `Enter` / `Space` | |
| `Escape` | |

_Role and accessible name; focus management (trap, return); live-region announcements;
`motion-reduce:` on animations; target size ≥ 24×24 px._

## Out of scope

_What this deliberately does not do (and which component does)._

## Open questions

-
