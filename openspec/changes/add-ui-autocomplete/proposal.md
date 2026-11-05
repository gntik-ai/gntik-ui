# Add Autocomplete to @gntik-ai/ui

## Why

No kit form control keeps free text while offering suggestions. Combobox commits listed items only, and `onCreate` adds a Create row instead of keeping the typed text. Console fields such as custom model ids, hostnames, regions and label keys accept new values but benefit from hints.

## What Changes

- Add `Autocomplete` to `@gntik-ai/ui`, built on `@base-ui/react/autocomplete`: the value is the input text; blur, Tab and Enter never replace it.
- Sync suggestions (flat or `{ label, items }` groups) or async `loadOptions` through the existing `useAsyncOptions`, with `onItemSelect`, `limit` with a refine status, opt-in inline completion (`mode="both"`), `clearable`, and Field integration.
- Add the `autocomplete.refine` message (en, es) in a sibling messages module and move `combobox.create` and `combobox.loadFailed` into it so `en.ts` and `es.ts` stay under 1000 lines.
- Add a sentence to the Autocomplete and Combobox docs on when to use which.

## Impact

- Capability: ui/autocomplete (ADDED). Risk R1, additive; Combobox, CommandPalette and `useAsyncOptions` behaviour is unchanged.
- Inline completion and the Escape handling are built in the wrapper because Base UI 1.9 copies the whole label for `mode="both"` and clears the input on Escape; tests guard both.
- Roll back by reverting this ChangeSet or pinning the previous kit release.
