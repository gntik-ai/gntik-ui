## Why

`Switch` has no pending state. Toggles that call an API stay interactive, so a second press while the request runs sends a conflicting call. `disabled` dims the switch and removes it from keyboard use, so the user loses their place. Button already has `loading`.

## What changes

- Add `loading?: boolean` and `loadingLabel?: string` to `SwitchProps`. While loading (and not disabled) the switch is Base UI `readOnly`, has `aria-busy="true"` and `data-loading`, shows the kit `Spinner` in the thumb, and adds a hidden `switch.saving` description (en `Saving…`, es `Guardando…`).
- `checked` stays as the app passes it; `disabled` wins over `loading`.
- Add `examples/SwitchSettingsPending.tsx` and a loading note in `Switch.doc.ts`.

## Out of scope

- Passing `loading` through `SettingsRow` or using it in `settings-integrations`.
- Treating a promise returned by `onCheckedChange` as pending automatically.
- Icons or text inside the track, invalid styling, a description prop, live-region announcements.

## Impact

- Additive optional prop on `@gntik-ai/ui` (minor). With `loading` unset the DOM is unchanged. Rollback: revert or pin the previous minor.
