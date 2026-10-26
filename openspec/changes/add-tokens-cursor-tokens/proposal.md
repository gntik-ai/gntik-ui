# Interactive and disabled cursor tokens

## Why

Controls use inconsistent cursor classes, and the catalog masks Button's missing cursor with a global rule. Consumers need one policy override shared by the kit.

## What Changes

- Add exported cursor tokens and Tailwind utilities with pointer and not-allowed defaults.
- Migrate interactive and disabled cursor classes in UI components; use the interactive cursor on Menu items.
- Give Button token cursors and guard all hover styles before restoring disabled pointer events.
- Remove the catalog button override and demonstrate the arrow policy in a live example.

## Impact

- Minor releases of `@gntik-ai/tokens` and `@gntik-ai/ui`, upgraded together.
- Disabled Buttons remain inert but now receive pointer events instead of allowing click-through.
- Brand values, drag/resize cursors, token JSON exports and other packages remain outside this change.
