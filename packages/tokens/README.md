# Tokens and palettes

Import `@gntik-ai/tokens/tailwind.css` (after Tailwind CSS) or `@gntik-ai/ui/styles.css`
for the complete token layer, including green and navy palettes.

For individual CSS exports, import these paths in order:

```css
@import '@gntik-ai/tokens/brand.css';
@import '@gntik-ai/tokens/status.css';
@import '@gntik-ai/tokens/pairing.css';
@import '@gntik-ai/tokens/scope.css';
@import '@gntik-ai/tokens/palettes/index.css';
```

`pairing.css` and `scope.css` depend on `status.css` for `--success-strong`.
The palette files supply colour values; they require `scope.css` to re-resolve
pairing aliases at palette boundaries and compose with nested light/dark scopes.
`palettes/navy.css` can replace `palettes/index.css` when only navy is needed.

Set `data-palette="navy"` on the document or a subtree. Palette composition uses
CSS `@scope`; green retains its original theme values in browsers without it.
High contrast ignores palettes. On a high-contrast page, explicit light/dark
scopes use their green theme values, including portalled overlays.

The named ids are exported as `PALETTES` and `PaletteId` from
`@gntik-ai/tokens/tokens` and `@gntik-ai/tokens/runtime`. JavaScript colour consumers
read live values with the runtime's `tokenChannels`, `tokenColor` or `tokenHex`,
and subscribe to theme and palette changes with `observeTheme`.
