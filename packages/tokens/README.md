# Tokens and palettes

Import `@gntik-ai/tokens/tailwind.css` (after Tailwind CSS) or `@gntik-ai/ui/styles.css`
for the complete token layer, including green and navy palettes.

For individual CSS exports, import these paths in order:

```css
@import '@gntik-ai/tokens/brand.css';
@import '@gntik-ai/tokens/status.css';
@import '@gntik-ai/tokens/pairing.css';
@import '@gntik-ai/tokens/tone.css';
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

## Shared semantic tones

`data-tone` supports `primary`, `success`, `warning`, `destructive`, `info`,
`neutral`, `violet`, `cyan`, `amber` and `rose`. It sets inherited HSL-channel
variables `--tone`, `--tone-text` and `--tone-chip-text` from existing tokens.
Unknown names (including flow states such as `failed`) clear these variables,
even inside a known tone; `bg-tone/15` then paints no tint. Descendants without
`data-tone` inherit the closest tone.

```html
<span data-tone="success" class="bg-tone/15 text-tone-chip-text">Healthy</span>
<div data-tone="warning" class="border border-tone/45 text-tone-text">Check usage</div>
```

Use `bg-tone`, `border-tone` and `text-tone` for the raw tone, `text-tone-text`
on background/card/popover surfaces, and `text-tone-chip-text` on 10–20% tints.
The info, neutral and category text aliases use foreground. Neutral's raw tone
is muted-foreground; categories use their category tokens. Badge, Alert, Token
and Progress expose their tone on the root and retain their role-specific
surfaces, icons and opacity strengths. Import `tone.css` after brand and pairing
when using standalone CSS; the Tailwind bridge includes it automatically.
The Badge docs include a live Shared Tone Utilities example for product markup.
