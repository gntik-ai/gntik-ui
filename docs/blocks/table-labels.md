# Table block labels

`PaginationFooter`, `FilterBar` and `DataTable` export optional, typed `labels` props from
`@gntik-ai/blocks`: `PaginationFooterLabels`, `FilterBarLabels` and `DataTableLabels`.
Each key and its signature and interaction state is listed in the block's `labels.doc.ts`,
its structured `labels` metadata (`list_kit` and `get_block`), and the generated kit registry
and `llms-full.txt` Labels sections. Catalog summaries keep the existing block descriptions:

- [PaginationFooter keys](../../packages/blocks/src/tables/PaginationFooter/labels.doc.ts)
- [FilterBar keys](../../packages/blocks/src/tables/FilterBar/labels.doc.ts)
- [DataTable keys](../../packages/blocks/src/tables/DataTable/labels.doc.ts)

Partial objects merge per key, including nested DataTable objects. A supplied label wins;
otherwise each surface keeps its existing I18nProvider key or hardcoded English default.
No provider, catalog key, default DOM structure, keyboard behavior or callback is changed.
FilterBar's older `searchLabel` and `placeholder` props still work; the corresponding labels
keys win when both are supplied. Caller headers, option labels, view names, page numbers,
row names, caption and noun remain caller content.

Cell values are caller content too. The existing default cell formatter displays raw booleans
as `Yes`/`No`; these are outside the block chrome labels contract. Return translated text from
the column's `accessor`, or provide a `cell` renderer, to control boolean text (and date or
missing-value formatting). For example, `accessor: (row) => row.enabled ? 'Enabled' : 'Disabled'`.

Formatters receive raw numbers and caller strings, and return the entire message. They can
use `Intl.PluralRules` and number formatting themselves. `rangeSummary` and `resultCount`
replace the entire live region; `selection.selectedCount` replaces the entire toolbar
announcement. `loading` receives the original caption. `grouping.groupRowCount` includes
both the count and noun. `columnMenu.pinSide` receives `left` or `right`. Errors returned or
thrown with a message by `onCellEdit` remain caller content; `edit.saveError` handles generic
rejection. Deleting a view remains immediate, without a confirmation dialog.

```tsx
import { DataTable, type DataTableLabels } from '@gntik-ai/blocks';

const labels: DataTableLabels = {
  columnMenu: { trigger: 'Choose columns' },
  selection: { selectedCount: (count) => `${count} chosen` },
  pagination: { rangeSummary: (from, to, total) => `${from}–${to} / ${total}` },
};

<DataTable labels={labels} />;
```

## Regression evidence

The checked-in JSONL fixtures were captured by `defaults.test.tsx` from the immutable source
`dde54ce4a82f122f5c0c10bc6e8e300f72484c8c` (@gntik-ai/blocks 0.5.0), in a separate workspace
checkout using the installed toolchain. Each state records text, accessible attributes,
semantic roles, focused control and callbacks. Both English and the existing Spanish provider
are compared in dark, light and high_contrast. Matrix tests assert individual elements and
reject strings absent from the maintained inventory, excluding explicit caller content.

The browser fixture uses a fixed 1280×900 viewport, bundled Geist fonts, reduced motion and
disabled screenshot animations. `playwright.table-labels.config.js` inherits the existing
`maxDiffPixelRatio: 0.01` threshold and checks contrast and other WCAG rules at every state.
The only axe exception is the named `SELECT_LISTBOX_79` entry for
[gntik-ai/gntik-ui#79](https://github.com/gntik-ai/gntik-ui/issues/79). It filters only that
Select listbox node from `aria-input-field-name`, preserving other nodes and rules.

The production docs build excludes the browser fixture and its en/es test labels. A separate
`vite.table-labels.config.js` builds only the test site. After building the production docs,
run from `apps/docs` with the installed toolchain and Chromium:

```sh
pnpm test:table-labels
```

`scripts/check-table-labels.mjs` extracts the blocks source at the immutable base into a
temporary workspace, builds the fixed fixture against it, and captures every default state
in all three themes. It then builds the same fixture against current source and compares
against those screenshots with updates disabled. Both builds share the installed dependencies,
fonts, UI source (unchanged by this ChangeSet) and Chromium version; no npm registry is used.
For shallow CI checkouts, the runner fetches only that exact public commit into a temporary
Git repository with credential helpers disabled. Neither the branch nor the worktree changes.

The existing required `pnpm a11y` command runs this comparison after the catalog axe suite,
so PR CI enforces the screenshot criterion and real browser axe checks, including contrast,
at every matrix state. jsdom axe checks exclude contrast because jsdom has no layout engine.
The production build exclusion also has an emitted-asset regression test in that command.
Screenshot files remain temporary and are never committed. The sandbox lacks Chromium;
the PR runner provides the browser evidence.
