/* ============================================================================
   Gntik UI · registry.jsx — component INVENTORY (single source of truth)
   Feeds: the catalog sidebar, the progress dashboard and the router.
   The actual sections register themselves in window.SECTIONS from each file.
   status: 'done' · 'wip' · 'todo'
   ============================================================================ */

const REGISTRY = [
  { group: 'Get started', icon: 'home', items: [
    { id: 'overview', label: 'Overview', icon: 'home', status: 'done', blurb: 'Inventory, progress and how to adopt the template.' },
    { id: 'install', label: 'Install', icon: 'bricks', status: 'done', blurb: 'Three ways in: gntik-ui CLI, shadcn CLI (/r/<id>.json) and package import.' },
  ]},
  { group: 'Foundations', icon: 'palette', items: [
    { id: 'foundations', label: 'Foundations', icon: 'palette', status: 'done', blurb: 'Tokens: color, typography, spacing, radii, shadows and icons.' },
    { id: 'theme-builder', label: 'Theme builder', icon: 'palette', status: 'done', blurb: 'Product name + SVG mark → BrandPreset: previews in 3 themes and a console, contrast checks, export.' },
  ]},
  { group: 'Library', icon: 'bricks', items: [
    { id: 'ui-components', label: '@gntik-ai/ui', icon: 'bricks', status: 'done', blurb: 'Package components on Base UI: live examples, keyboard contract and source.' },
  ]},
  { group: 'Compositions', icon: 'layout', items: [
    { id: 'layouts', label: 'Layouts', icon: 'layout', status: 'done', blurb: 'Twelve page layouts: shells, split, inspector, canvas, settings, auth, wizard, docs, status, print.' },
    { id: 'blocks', label: 'Blocks', icon: 'bricks', status: 'done', blurb: 'Page sections composed from the kit, previewed per device and theme.' },
    { id: 'templates', label: 'Page templates', icon: 'grid', status: 'done', blurb: 'Complete kit pages, including create-wizard and its dialog-wizard overlay variant.' },
  ]},
  { group: 'App shell', icon: 'layout', items: [
    { id: 'app-shell', label: 'App shell', icon: 'layout', status: 'done', blurb: 'Sidebar + topbar + page header. The shared chrome.' },
  ]},
  { group: 'Headings', icon: 'heading', items: [
    { id: 'page-headings', label: 'Page headings', icon: 'heading', status: 'done', blurb: 'Page title + meta + actions, with tabs and banner.' },
    { id: 'section-headings', label: 'Section headings', icon: 'heading', status: 'done', blurb: 'Block headers inside the content.' },
    { id: 'card-headings', label: 'Card headings', icon: 'heading', status: 'done', blurb: 'Card headers with actions and description.' },
  ]},
  { group: 'Data', icon: 'database', items: [
    { id: 'description-lists', label: 'Description lists', icon: 'list', status: 'done', blurb: 'Key-value pairs for resource details.' },
    { id: 'stats', label: 'Stats', icon: 'chart', status: 'done', blurb: 'Stat cards with delta + mini charts (bars/lines/donut).' },
    { id: 'billing-usage', label: 'Billing & usage', icon: 'creditcard', status: 'done', blurb: 'Plan, quota meters, invoice, spend vs budget and cost breakdown.' },
    { id: 'calendars', label: 'Calendars', icon: 'calendar', status: 'done', blurb: 'Schedulers: month, week, day and borderless views.' },
  ]},
  { group: 'Charts', icon: 'line', items: [
    { id: 'area-charts', label: 'Area charts', icon: 'activity', status: 'done', blurb: 'Filled trend — simple and stacked.' },
    { id: 'bar-charts', label: 'Bar charts', icon: 'chart', status: 'done', blurb: 'Counts by category — stacked, grouped and horizontal.' },
    { id: 'line-charts', label: 'Line charts', icon: 'line', status: 'done', blurb: 'Thin series for comparing trends.' },
    { id: 'combo-charts', label: 'Combo charts', icon: 'bricks', status: 'done', blurb: 'Bars + line with dual axis.' },
    { id: 'donut-charts', label: 'Donut charts', icon: 'coin', status: 'done', blurb: 'Share of a total — donut and pie.' },
  ]},
  { group: 'Lists', icon: 'list', items: [
    { id: 'stacked-lists', label: 'Stacked lists', icon: 'list', status: 'done', blurb: 'Stacked rows with avatar, meta and action.' },
    { id: 'tables', label: 'Tables', icon: 'table', status: 'done', blurb: 'Dense table with status, sorting and selection.' },
    { id: 'grid-lists', label: 'Grid lists', icon: 'grid', status: 'done', blurb: 'Card grid for resources.' },
    { id: 'list-containers', label: 'List containers', icon: 'box', status: 'done', blurb: 'List containers (simple, divided, in a card).' },
    { id: 'feeds', label: 'Feeds', icon: 'activity', status: 'done', blurb: 'Activity and setup: lifecycle, comments, mixed feed, status timeline, checklists and tabbed panel.' },
  ]},
  { group: 'Forms', icon: 'form', items: [
    { id: 'form-layouts', label: 'Form layouts', icon: 'form', status: 'done', blurb: 'Inputs, textarea, switch, checkbox and form sections.' },
    { id: 'input-groups', label: 'Input groups', icon: 'form', status: 'done', blurb: 'Add-ons, icons, prefixes, attached button, states and sizes.' },
    { id: 'file-upload', label: 'File upload', icon: 'upload', status: 'done', blurb: 'Multi-file dropzone with progress, compact input and logo upload.' },
    { id: 'textareas', label: 'Textareas', icon: 'form', status: 'done', blurb: 'Simple textarea, composer with toolbar and character counter.' },
    { id: 'select-menus', label: 'Select menus', icon: 'chevron', status: 'done', blurb: 'Native select and custom listbox with check, avatar and status.' },
    { id: 'comboboxes', label: 'Comboboxes', icon: 'search', status: 'done', blurb: 'Autocomplete with live filtering, avatars and status.' },
    { id: 'checkboxes', label: 'Checkboxes', icon: 'check', status: 'done', blurb: 'List with description, inline and as selectable cards.' },
    { id: 'radio-groups', label: 'Radio groups', icon: 'toggle', status: 'done', blurb: 'List, stacked cards and colour-coded segmented selection.' },
    { id: 'toggles', label: 'Toggles', icon: 'toggle', status: 'done', blurb: 'Switches: simple, with label, with icon and setting row.' },
    { id: 'action-panels', label: 'Action panels', icon: 'box', status: 'done', blurb: 'Action panels: with button, input, toggle and well.' },
    { id: 'date-time-picker', label: 'Date & time picker', icon: 'calendar', status: 'done', blurb: 'Editable date and time picker: popover with calendar + slots and typeable inputs.' },
    { id: 'sign-in', label: 'Sign-in & sign-up', icon: 'lock', status: 'done', blurb: 'Auth split: brand panel + form + SSO.' },
  ]},
  { group: 'Feedback', icon: 'bell2', items: [
    { id: 'alerts', label: 'Alerts', icon: 'alert', status: 'done', blurb: 'Info, warning and destructive, with actions.' },
    { id: 'empty-states', label: 'Empty states', icon: 'inbox', status: 'done', blurb: 'Empty states with a CTA.' },
    { id: 'skeletons', label: 'Skeletons', icon: 'bricks', status: 'done', blurb: 'Loading states: blocks, list, table and loading → loaded swap.' },
    { id: 'spinners', label: 'Spinners', icon: 'refresh', status: 'done', blurb: 'Loading indicators: three dots, circular and brand loader.' },
  ]},
  { group: 'Navigation', icon: 'compass', items: [
    { id: 'navbars', label: 'Navbars', icon: 'menu', status: 'done', blurb: 'Top bar with nav, search and profile.' },
    { id: 'breadcrumbs', label: 'Breadcrumbs', icon: 'chevronRight', status: 'done', blurb: 'Breadcrumbs with separator and truncation.' },
    { id: 'tabs', label: 'Tabs', icon: 'layout', status: 'done', blurb: 'Pills, underline and with badges.' },
    { id: 'vertical-nav', label: 'Vertical navigation', icon: 'list', status: 'done', blurb: 'Side nav with groups and icons.' },
    { id: 'sidebar-nav', label: 'Sidebar navigation', icon: 'layout', status: 'done', blurb: 'Collapsible product sidebar.' },
    { id: 'pagination', label: 'Pagination', icon: 'arrow', status: 'done', blurb: 'Numbered and prev/next pagination.' },
    { id: 'progress-bars', label: 'Progress bars', icon: 'activity', status: 'done', blurb: 'Bars, steps and circular.' },
    { id: 'command-palettes', label: 'Command palettes', icon: 'search', status: 'done', blurb: '⌘K with search, groups and shortcuts.' },
  ]},
  { group: 'Overlays', icon: 'layers', items: [
    { id: 'modal-dialogs', label: 'Modal dialogs', icon: 'layout', status: 'done', blurb: 'Modals with scrim, confirmation and form.' },
    { id: 'drawers', label: 'Drawers', icon: 'layout', status: 'done', blurb: 'Side panels for details and editing.' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', status: 'done', blurb: 'Stacked toasts with action and auto-dismiss.' },
    { id: 'tooltips', label: 'Tooltips', icon: 'info', status: 'done', blurb: 'Ephemeral hint: solid, in an icon toolbar and rich in a card.' },
  ]},
  { group: 'Elements', icon: 'box', items: [
    { id: 'buttons', label: 'Buttons', icon: 'box', status: 'done', blurb: 'Variants, sizes, icons and states.' },
    { id: 'button-groups', label: 'Button groups', icon: 'grid', status: 'done', blurb: 'Segmented and split buttons.' },
    { id: 'badges', label: 'Badges & pills', icon: 'spark', status: 'done', blurb: 'Status pills, badges y tags.' },
    { id: 'avatars', label: 'Avatars', icon: 'user', status: 'done', blurb: 'Avatar, initials, group and status.' },
    { id: 'dropdowns', label: 'Dropdowns', icon: 'dot3', status: 'done', blurb: 'Menus with groups, checks and danger.' },
    { id: 'dividers', label: 'Dividers', icon: 'minus', status: 'done', blurb: 'Separators with label and action.' },
  ]},
  { group: 'Layout', icon: 'box', items: [
    { id: 'containers', label: 'Containers', icon: 'box', status: 'done', blurb: 'Content widths and page paddings.' },
    { id: 'cards', label: 'Cards', icon: 'box', status: 'done', blurb: 'Cards: simple, with header, with footer.' },
  ]},
  { group: 'Filters', icon: 'filter', items: [
    { id: 'filters', label: 'Filters', icon: 'filter', status: 'done', blurb: 'Toolbar: search + popovers + chips + saved views.' },
  ]},
  { group: 'Flow', icon: 'flowGraph', items: [
    { id: 'reactflow', label: 'ReactFlow', icon: 'flowGraph', status: 'done', blurb: 'Node canvas: drag, zoom/pan, handles and edges.' },
  ]},
  { group: 'Editors', icon: 'code', items: [
    { id: 'monaco', label: 'Monaco Editor', icon: 'code', status: 'done', blurb: 'The VS Code editor, themed: editing, diff, embedded and multi-language.' },
  ]},
];

function regFlat() { return REGISTRY.flatMap(g => g.items.map(it => ({ ...it, group: g.group }))); }
function regFind(id) { return regFlat().find(it => it.id === id); }
function regCounts() {
  const all = regFlat();
  return {
    total: all.length,
    done: all.filter(i => i.status === 'done').length,
    wip: all.filter(i => i.status === 'wip').length,
    todo: all.filter(i => i.status === 'todo').length,
  };
}

window.SECTIONS = window.SECTIONS || {};
Object.assign(window, { REGISTRY, regFlat, regFind, regCounts });

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
