# Tokens and palettes

Import `@gntik-ai/tokens/tailwind.css` (after Tailwind CSS) or `@gntik-ai/ui/styles.css`
for the complete token layer, including the green, navy and corporate palettes.

For individual CSS exports, import these paths in order:

```css
@import '@gntik-ai/tokens/brand.css';
@import '@gntik-ai/tokens/status.css';
@import '@gntik-ai/tokens/pairing.css';
@import '@gntik-ai/tokens/tone.css';
@import '@gntik-ai/tokens/scope.css';
@import '@gntik-ai/tokens/palettes/index.css';
@import '@gntik-ai/tokens/typography.css';
```

`pairing.css` and `scope.css` depend on `status.css` for `--success-strong`.
The palette files supply colour values; they require `scope.css` to re-resolve
pairing aliases at palette boundaries and compose with nested light/dark scopes.
`palettes/navy.css` or `palettes/corporate.css` can replace `palettes/index.css` when only one is needed.

Set `data-palette="navy"` on the document or a subtree. Palette composition uses
CSS `@scope`; green retains its original theme values in browsers without it.
High contrast ignores palette colours, while retaining palette typography. On a high-contrast page, explicit light/dark
scopes use their green theme values, including portalled overlays.

The named ids are exported as `PALETTES` and `PaletteId` from
`@gntik-ai/tokens/tokens` and `@gntik-ai/tokens/runtime`. JavaScript colour consumers
read live values with the runtime's `tokenChannels`, `tokenColor` or `tokenHex`,
and subscribe to theme and palette changes with `observeTheme`.

## Typography in palettes

Palettes can override `--font-sans`, `--font-mono`, `--font-style-emphasis` and
`--text-transform-label`. Defaults remain Geist, Geist Mono, italic emphasis and
uppercase labels for green and navy. Define typography on the palette
boundary independently of its guarded colour rules so it also applies in high
contrast. Keep shared high-contrast colours unchanged.

Typography defaults have zero specificity, so a palette on `html` can override
them even when `typography.css` is imported last. Font inheritance and `em`/`i`
styles use the base layer; explicit utilities such as `font-mono` and
`not-italic` still take precedence.

```css
@import '@gntik-ai/tokens/fonts/inter.css';

/* Add this after the kit styles to opt this palette into typography. */
[data-palette='navy'] {
  --font-sans: 'Inter', 'Geist', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Courier New', monospace;
  --font-style-emphasis: normal;
  --text-transform-label: none;
}
```

Import the Inter stylesheet explicitly in the consumer's global CSS, after the
kit styles. The package ships upright variable WOFF2 subsets (weights 100–900)
with relative URLs and the SIL Open Font License 1.1 attribution in `fonts/OFL.txt`.
The consumer's bundler copies the files to its own origin; there are no remote
font hosts. Inter is optional and never replaces Geist by default. If it cannot
load, the next family in the sans stack is used. Italic files are not shipped:
set emphasis to `normal` for an upright palette.

For kit maintenance, `pnpm --filter @gntik-ai/tokens fonts:sync` refreshes the
committed upright subsets, stylesheet and licence from the installed
`@fontsource-variable/inter` development dependency without network access.

Set `data-palette` on a `ThemeScope` to carry the palette into its body portal.
Sans fonts resolve again at each palette and portal boundary; nested palettes
reset typography to their own defaults before applying overrides. `em`, `i`,
CodeBlock comments, JsonViewer null, Terminal ANSI italics, ModelPicker reasons
and Markdown images without a safe URL use `--font-style-emphasis`.

CodeEditor and both DiffEditor panes use only `--font-mono`, including live
ancestor palette changes without remounting. An explicit `options.fontFamily`
wins; removing it restores the palette font. Glyphs are remeasured after a font
change. Editor colours and mode always follow `html`, even in nested scopes.
Monaco's fixed overflow widgets (suggestions and hovers) can render outside the
host and may not inherit its typography.

Use sentence case for headings and labels. Reserve uppercase for short labels
of up to three words; set `--text-transform-label: none` to disable automatic
uppercase. The `label-case` utility replaces automatic uppercase in:

- UI: CodeBlock language labels, CommandPalette group headings, KeyValueEditor headers, ListInput headers,
  MegaMenu labels, Menu group labels, NavList headings, OverflowList popup titles,
  PermissionMatrix headers, PowerSearch headings, Select group labels, Separator
  kickers, StatusTag's uppercase variant, Stepper counters, Table headers and Tour steps.
- Layouts: CanvasLayout labels, DocsLayout headings, PrintLayout kickers and StatusLayout kickers.
- Chat: Citation source headings, Markdown code language labels, SuggestionChips headings and ToolCallCard labels.
- Blocks: PromptEditor labels, auth headings and dividers, PaymentMethodCard labels,
  CodePanel headings, FlowBuilder labels, ActivityFeed group headings, ComparisonTable
  headers, FeatureGrid eyebrows, PricingTable badges, AgendaList day headings, MonthCalendar
  weekdays and FilterBar labels.
- Templates: docs-article contents, run-trace labels, search-results headings and sign-in eyebrows.
- Live examples: CarouselProjects, ResizableWorkspace, TokenFilters, VirtualListLogs,
  AuthLayoutSplit, CanvasLayoutFlowEditor, DocsLayoutGuide and PrintLayoutInvoice.

OtpInput retains uppercase input characters. The Code editor template's
"Typography in palettes" live preview demonstrates scoped fonts, upright
emphasis, sentence-case labels, portals and nested editors across all three themes.

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

## Corporate palette

`data-palette="corporate"` is an opt-in palette with complete light and dark colours, shadows,
Inter typography (`--font-sans` starts with `Inter`, emphasis is upright and labels keep their
written case) and the optional `--chart-series-1` to `--chart-series-12` tokens. Import
`@gntik-ai/tokens/fonts/inter.css` to self-host Inter. Hue follows the supplied identity colours;
only lightness (and saturation of neutral tints) is adjusted to meet contrast, and borders reach 3:1.

Chart series tokens exist only in this palette. Charts with no explicit `colors` use
`--chart-series-N` and fall back to the categorical accents when it is undefined: other palettes,
nested palette islands and high contrast clear it. Identity rules: one highlight colour per page,
sentence case, no italics. High contrast keeps the shared colours.
