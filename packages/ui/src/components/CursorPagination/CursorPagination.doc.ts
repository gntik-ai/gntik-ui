import type { ComponentDoc } from '../../doc';

export const doc: ComponentDoc = {
  name: 'CursorPagination',
  group: 'Navigation',
  status: 'beta',
  description:
    'See the cursor-pager-footer block example for data-table paginated={false} with a consumer-owned token stack. Stateless Previous/Next navigation for consumer-owned cursor stacks, with no page numbers, ranges or invented totals. Supply a plain-text summary (null keeps it empty) or shownCount with required labels.shownSummary and labels.totalSummary; only a positive exact total uses totalSummary. A pageSizeOptions select requires pageSize, onPageSizeChange, labels.rowsPerPage and labels.rowsPerPageLabel. Flat previousLabel, nextLabel and ariaLabel override labels.previous, labels.next and labels.navLabel, then provider catalog defaults. loading and busy are aliases: rendered buttons stay focusable and aria-disabled with aria-busy, while the select stays enabled. loadingLabel defaults to the catalog; null keeps the summary during busy. One persistent polite status writes once per changed text; mount, empty text and unchanged commits do not announce. Removal of the focused control moves focus to Next, Previous, the select or the nav root, in that order, even while busy; focus elsewhere never moves.',
  primitive: '@base-ui/react/button + @base-ui/react/select (kit Button and SimpleSelect)',
  pattern: 'named navigation landmark with one persistent polite atomic status',
  keyboard: [
    ['Tab / Shift+Tab', 'Moves through the select (when present), Previous and Next, including aria-disabled buttons'],
    ['Enter / Space', 'Activates an available button once; busy and unavailable buttons do nothing; opens the select'],
    ['ArrowDown / ArrowUp', 'Opens the select and moves between page-size options'],
    ['Enter / Escape', 'Selects the highlighted page size or closes the select; focus returns to its trigger'],
  ],
  tokens: [
    'card',
    'border',
    'foreground',
    'muted-foreground',
    'secondary',
    'focus-ring',
    'background',
    'primary',
    'ring',
    'popover',
    'popover-foreground',
    'primary-text',
  ],
};
