import { copy } from '../src/block-labels-copy.js';

// Explicit expected tables: caller content and formatter results are not derived from block code.
export const ranges = {
  en: {
    initial: 'Range 1|10|97',
    next: 'Range 11|20|97',
    previous: 'Range 1|10|97',
    numbered: 'Range 21|30|97',
    open: 'Range 21|30|97',
    resized: 'Range 1|25|97',
  },
  es: {
    initial: 'Rango 1|10|97',
    next: 'Rango 11|20|97',
    previous: 'Rango 1|10|97',
    numbered: 'Rango 21|30|97',
    open: 'Rango 21|30|97',
    resized: 'Rango 1|25|97',
  },
};
export const results = {
  en: {
    initial: 'Found 12',
    menu: 'Found 12',
    selected: 'Found 11',
    focused: 'Found 11',
    removed: 'Found 12',
    clear: 'Found 12',
    views: 'Found 12',
    applied: 'Found 11',
  },
  es: {
    initial: 'Encontrados 12',
    menu: 'Encontrados 12',
    selected: 'Encontrados 11',
    focused: 'Encontrados 11',
    removed: 'Encontrados 12',
    clear: 'Encontrados 12',
    views: 'Encontrados 12',
    applied: 'Encontrados 11',
  },
};
export const numericArgs = {
  initial: [1, 10, 97],
  next: [11, 20, 97],
  previous: [1, 10, 97],
  numbered: [21, 30, 97],
  open: [21, 30, 97],
  resized: [1, 25, 97],
};

// These fixture states are an independent oracle, not computed from component code.
const paginationStates = {
  initial: { pages: ['1', '2', '3', '4', '5', '10'], size: '10' },
  next: { pages: ['1', '2', '3', '4', '5', '10'], size: '10' },
  previous: { pages: ['1', '2', '3', '4', '5', '10'], size: '10' },
  numbered: { pages: ['1', '2', '3', '4', '5', '10'], size: '10' },
  open: { pages: ['1', '2', '3', '4', '5', '10'], size: '10', options: ['10', '25', '50', '100'] },
  resized: { pages: ['1', '2', '3', '4'], size: '25' },
};
const filterStates = {
  initial: {},
  menu: { menu: true },
  selected: { chip: true },
  focused: { chip: true },
  removed: {},
  clear: {},
  views: { options: true },
  applied: { chip: true, view: 'Saved' },
};
const tableStates = {
  initial: {},
  columns: { columns: true },
  toggled: { columns: true, hidden: true, dirty: true },
  'pin-options': { columns: true, pin: true, hidden: true, dirty: true },
  pinned: { hidden: true, dirty: true },
  'left-suffix': { columns: true, pin: true, suffix: 'pinnedLeft', hidden: true, dirty: true },
  'pinned-right': { hidden: true, dirty: true, right: true },
  'right-suffix': { columns: true, pin: true, suffix: 'pinnedRight', hidden: true, dirty: true, right: true },
  unpinned: { hidden: true, dirty: true },
  resized: { hidden: true, dirty: true, width: 210 },
  compact: { hidden: true, dirty: true, width: 210 },
  comfortable: { hidden: true, dirty: true, width: 210 },
  selected: { hidden: true, dirty: true, width: 210, selected: true },
  views: { hidden: true, dirty: true, width: 210, selected: true, views: true },
  'view-selected': { view: 'Saved', selected: true },
  'save-dialog': { view: 'Saved', selected: true, dialog: 'save' },
  'save-cancelled': { view: 'Saved', selected: true },
  saved: { view: 'Snapshot', selected: true },
  'rename-dialog': { view: 'Snapshot', selected: true, dialog: 'rename' },
  'rename-cancelled': { view: 'Snapshot', selected: true },
  renamed: { view: 'Renamed', selected: true },
  'dirty-view': { view: 'Renamed', selected: true, dirty: true, views: true },
  'changes-saved': { view: 'Renamed', selected: true },
  reset: { view: 'Renamed', selected: true },
  deleted: { selected: true, dirty: true },
  empty: { empty: true },
  loading: { loading: true },
  grouped: { grouped: true },
  editing: { editing: 'rest' },
  'edit-input': { editing: 'name' },
  'edit-error': { editing: 'name', error: 'editError' },
  'edit-minimum': { editing: 'quantity', error: 'minimum' },
  'edit-maximum': { editing: 'quantity', error: 'maximum' },
};

// Every entry binds an expected value to a public element and surface. Selectors never use
// the expected translated name, so exchanging two labels on the UI cannot pass these checks.
export function expectedTable(block, language, state) {
  const l = copy[language];
  const es = language === 'es';
  const elements = [];
  const caller = [];
  const add = (key, selector, surface, ...values) => elements.push({ key, selector, surface, values });
  const name = (key, selector, ...values) => add(key, selector, 'name', ...values);
  const text = (key, selector, ...values) => add(key, selector, 'text', ...values);
  const pagination = (summary, size, pages, options, captionSelector) => {
    text('rowsPerPage', captionSelector, l.rowsPerPage);
    name('rowsPerPageLabel', '#root [role="combobox"]', l.rowsPerPageLabel);
    text('caller:pageSize', '#root [role="combobox"]', size);
    text('rangeSummary', '#root p[aria-live]', summary);
    name('paginationNav', '#root nav', es ? 'Páginas de Items' : 'Pages for Items');
    name('previous', '#root nav li:first-child button', l.previous);
    name('next', '#root nav li:last-child button', l.next);
    name(
      'page',
      '#root nav li:not(:first-child):not(:last-child) button',
      ...pages.map((n) => `${es ? 'Ir a' : 'Go to'} ${n}`),
    );
    text('caller:page', '#root nav li:not(:first-child):not(:last-child) button', ...pages);
    if (options) {
      text('caller:pageSizeOptions', '[role="listbox"]:visible [role="option"]', ...options);
      name('caller:pageSizeOptions', '[role="listbox"]:visible [role="option"]', ...options);
    }
  };
  if (block === 'pagination') {
    const s = paginationStates[state];
    pagination(ranges[language][state], s.size, s.pages, s.options, '#root > div > div:first-child > span');
  } else if (block === 'filter') {
    const s = filterStates[state];
    name('searchLandmark', '#root [role="search"]', l.searchLandmark);
    name('searchLabel', '#root input[type="search"]', l.searchLabel);
    add('searchPlaceholder', '#root input[type="search"]', 'placeholder', l.searchPlaceholder);
    name('savedViewLabel', '#root [role="combobox"]', l.savedViewLabel);
    text(s.view ? 'caller:view' : 'savedViewPlaceholder', '#root [role="combobox"]', s.view || l.savedViewPlaceholder);
    name('addFilter', '#root button[aria-haspopup="menu"]', l.addFilter);
    text('addFilter', '#root button[aria-haspopup="menu"]', l.addFilter);
    text('resultCount', '#root [aria-live]', results[language][state]);
    if (s.chip) {
      name('activeFilters', '#root ul', l.activeFilters);
      text('filters', '#root [role="search"] > div:last-child > span', l.filters);
      name('clearAll', '#root [role="search"] > div:last-child > button', l.clearAll);
      text('clearAll', '#root [role="search"] > div:last-child > button', l.clearAll);
      name('removeFilter', '#root ul button', es ? 'Quitar Status|Ready' : 'Drop Status|Ready');
      text('caller:chipField', '#root ul li > span > span:first-child', 'Status:');
      text('caller:chipValue', '#root ul li > span > span:nth-child(2)', 'Ready');
    }
    if (s.menu) {
      text('caller:field', '[role="menu"] [role="group"] > :first-child', 'Status');
      name('caller:options', '[role="menuitemcheckbox"]', 'Ready', 'Failed');
      caller.push('Ready', 'Failed');
    }
    if (s.options) {
      name('caller:views', '[role="listbox"]:visible [role="option"]', 'Saved');
      caller.push('Saved');
    }
  } else {
    const s = tableStates[state];
    const viewTrigger = '#root button[aria-haspopup="menu"]:has(.max-w-40)';
    const view = s.view || l.defaultView;
    name('defaultView/modified/caller:view', viewTrigger, s.dirty ? `${view} ${l.modified}` : view);
    text(s.view ? 'caller:view' : 'defaultView', `${viewTrigger} .max-w-40`, view);
    if (s.dirty) text('modified', `${viewTrigger} .sr-only`, l.modified);
    name('density', '#root [role="group"][aria-label]', l.density);
    name('comfortable', '#root [role="group"][aria-label] button:first-child', l.comfortable);
    name('compact', '#root [role="group"][aria-label] button:last-child', l.compact);
    const columnsTrigger = '#root button[aria-haspopup="menu"]:not(:has(.max-w-40)):not(table button)';
    name('columns', columnsTrigger, l.columns);
    text('columns', columnsTrigger, l.columns);
    name('selectAll', '#root thead [role="checkbox"]', l.selectAll);
    text('actions', '#root thead th:last-child', l.actions);
    const cols = s.right ? ['Quantity', 'Name'] : s.hidden ? ['Name', 'Quantity'] : ['Name', 'Region', 'Quantity'];
    const widths = s.right ? [120, 200] : s.hidden ? [s.width || 200, 120] : [200, 160, 120];
    name('resizeColumn', '#root [data-column-resizer]', ...cols.map((c) => `${es ? 'Ancho de' : 'Width for'} ${c}`));
    add(
      'columnWidth',
      '#root [data-column-resizer]',
      'aria-valuetext',
      ...widths.map((w) => `${w} ${es ? 'píxeles' : 'pixels wide'}`),
    );
    caller.push('Items', ...cols);
    if (!s.empty && !s.loading) {
      name(
        'selectRow',
        '#root [data-row-id] [role="checkbox"]',
        es ? 'Elegir Alpha' : 'Choose Alpha',
        es ? 'Elegir Beta' : 'Choose Beta',
      );
      name(
        'rowActions',
        '#root [data-row-id] button[aria-haspopup="menu"]',
        es ? 'Opciones de Alpha' : 'Options for Alpha',
        es ? 'Opciones de Beta' : 'Options for Beta',
      );
      caller.push('Alpha', 'Beta', '2', '3');
      if (!s.hidden) caller.push('West', 'East');
      pagination(
        es ? 'Rango 1|2|2' : 'Range 1|2|2',
        '10',
        ['1'],
        undefined,
        '#root > div > div:last-child > div:first-child > span',
      );
    }
    if (s.selected) text('selectionCount', '#root span[aria-live]', es ? 'Elegidos 1' : 'Chosen 1');
    if (s.columns) {
      const columnMenu = '[role="menu"]:has([role="menuitemcheckbox"])';
      text('visibleColumns', `${columnMenu} > [role="group"]:first-child > :first-child`, l.visibleColumns);
      text('pinColumns', `${columnMenu} > [role="group"]:last-child > :first-child`, l.pinColumns);
      name('caller:columns', '[role="menuitemcheckbox"]', 'Name', 'Region', 'Quantity');
      const pinNames = s.hidden ? [`Name${s.suffix ? l[s.suffix] : ''}`, 'Quantity'] : ['Name', 'Region', 'Quantity'];
      name('pinnedRight/caller:columns', '[role="menuitem"][aria-haspopup="menu"]', ...pinNames);
      caller.push('Name', 'Region', 'Quantity');
      if (s.suffix) {
        text(s.suffix, '[role="menuitem"][aria-haspopup="menu"] .ms-auto', l[s.suffix]);
      }
    }
    if (s.pin) {
      name('pinLeft/pinRight/unpinned', '[role="menuitemradio"]', l.pinLeft, l.pinRight, l.unpinned);
      caller.push(l.pinLeft, l.pinRight, l.unpinned);
    }
    if (s.views) {
      text('views', '[role="menu"]:visible > [role="group"] > :first-child', l.views);
      name(
        'defaultViewOption/caller:views',
        '[role="menuitemradio"]',
        l.defaultViewOption,
        'Saved',
        ...(s.view === 'Renamed' ? ['Renamed'] : []),
      );
      name(
        'saveChanges/saveAs/renameView/deleteView/resetChanges',
        '[role="menuitem"]:not([aria-haspopup="menu"])',
        l.saveChanges,
        l.saveAs,
        l.renameView,
        l.deleteView,
        l.resetChanges,
      );
      caller.push(
        l.defaultViewOption,
        'Saved',
        ...(s.view === 'Renamed' ? ['Renamed'] : []),
        l.saveChanges,
        l.saveAs,
        l.renameView,
        l.deleteView,
        l.resetChanges,
      );
    }
    // An open modal hides the background from the accessibility tree, but visible text is
    // still collected there. Keep text checks and disable only background name assertions.
    if (s.dialog) {
      for (const entry of elements) entry.background = true;
      const title = l[s.dialog === 'rename' ? 'renameViewTitle' : 'saveViewTitle'];
      name('dialogTitle', '[role="dialog"]', title);
      text('dialogTitle', '[role="dialog"] h2', title);
      name('viewName', '[role="dialog"] input', l.viewName);
      text('viewName', '[role="dialog"] label', l.viewName);
      name('closeDialog', '[role="dialog"] button[aria-label]', l.closeDialog);
      name('cancel', '[role="dialog"] button:not([aria-label]):not([type="submit"])', l.cancel);
      name(
        s.dialog === 'rename' ? 'rename' : 'saveView',
        '[role="dialog"] button[type="submit"]',
        l[s.dialog === 'rename' ? 'rename' : 'saveView'],
      );
      caller.push(l.cancel, l[s.dialog === 'rename' ? 'rename' : 'saveView']);
    }
    if (s.empty) {
      text('emptyTitle', '#root h3', l.emptyTitle);
      text('emptyDescription', '#root h3 + p', l.emptyDescription);
    }
    if (s.loading) text('loading', '#root [role="status"]', es ? 'Cargando Items' : 'Fetching Items');
    if (s.grouped) {
      name(
        'selectGroup',
        '#root [data-group-header] [role="checkbox"]',
        es ? 'Elegir grupo Sin grupo' : 'Choose group Ungrouped',
      );
      name(
        'noGroup/groupRows',
        '#root [data-group-header] button',
        es ? 'Sin grupo 2 filas: 2' : 'Ungrouped 2 records: 2',
      );
      text('noGroup', '#root [data-group-header] button > span:first-of-type', l.noGroup);
      text('groupRows', '#root [data-group-header] .sr-only', es ? 'filas: 2' : 'records: 2');
    }
    if (s.editing) {
      text('editHint', '#root > div > span.sr-only', l.editHint);
      if (s.editing !== 'rest') {
        const col = s.editing === 'name' ? 'Name' : 'Quantity';
        name('editLabel', '#root [data-cell-editor] input', `${col} ${es ? 'de' : 'on'} Alpha`);
      }
      if (s.error)
        text(
          s.error,
          '#root [role="alert"]',
          s.error === 'minimum'
            ? es
              ? 'Mínimo 1'
              : 'Minimum 1'
            : s.error === 'maximum'
              ? es
                ? 'Máximo 10'
                : 'Maximum 10'
              : l.editError,
        );
    }
  }
  return { elements, strings: [...caller, ...elements.flatMap((entry) => entry.values)] };
}
