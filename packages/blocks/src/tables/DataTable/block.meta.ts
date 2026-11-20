import type { BlockMeta } from '../../meta';
import type { DataTableLabels } from './labels';

export const meta: BlockMeta = {
  name: 'Data table',
  family: 'tables',
  status: 'beta',
  description:
    'Typed data table with sorting, selection, pagination and saved views. ' +
    'Opt-in stickyHeader (default false) pins the header of a non-virtual table to the nearest scrolling ancestor, stickyHeaderOffset below its top (a number is px, a string any CSS length such as 3.5rem; default 0), written to --data-table-sticky-top. SidebarLayout scrolls main below its topbar, so the default 0 fits; StackedLayout scrolls its root under a 60 px header, so pass stickyHeaderOffset={60}. The root carries data-sticky-header="page", the card clips with overflow-clip and isolate instead of overflow-hidden, and header cells are opaque (bg-card) with the head tint under their content, pinned cells above the others. A table wider than its container (1 px tolerance, measured with a ResizeObserver) switches to data-sticky-header="bounded": a focusable region named by the caption whose max-height is the scroller\'s visible height minus the offset, so its horizontal scrollbar stays on screen; it returns to page mode once the table fits. maxHeight (a number is px, or any CSS length) bounds a non-virtual body in such a region at any width, keeps every row mounted, takes precedence over stickyHeader and replaces the max-h-[32rem] default of a virtualized table. autoPageSize ignores both. Body rows scroll-margin-top the offset plus the measured header height and a cell padding (0.75rem), so keyboard focus is never hidden under the pinned header. Without the props nothing changes. See examples/sticky-header.tsx (sidebar layout and maxHeight) and examples/sticky-header-stacked.tsx (offset 60, wide table). ' +
    'Opt-in onRowReorder(move: DataTableRowMove) adds a grip handle after selection and before details. isRowReorderable(row) locks individual handles; other rows can move past them. Space picks up, arrows and Home/End preview, Space/Enter drop, Escape/Tab cancel, and Alt+ArrowUp/ArrowDown commit a single step. Pointer dragging starts past 5px or a 250ms touch hold; links, checkboxes and actions remain independent. The caller applies the move with reorderRows(rows, move). Indexes refer to supplied rows; toIndex is the insertion index after removal. previousId/nextId describe the final neighbours, including adjacent pages; moves stay within the current client page. Sorting, grouping, quick filters, filterModel and external filters disable handles with an explanation. Data changes cancel a drag. Reordering disables virtualization; virtualize=true warns once in development. The nearest LiveAnnouncer announces pickup, move, drop and cancellation using the en/es table.reorder, reorderRow, reorderInstructions, reorderUnavailable, rowPickedUp, rowMoved, rowDropped and rowMoveCancelled catalog keys. See examples/row-reorder.tsx for routing priorities, a locked fallback, pinned columns and filters. ' +
    'Optional column.filter adds a sibling header popover with draft edits, Apply/Enter, Clear and Escape discard with focus return. Types: enum (in, searchable or more than eight options shows search), text (contains), number (gte/lte for one bound, inclusive between for two), date (inclusive between via DateRangePicker), boolean (Any/Yes/No), custom (render receives value, setValue, apply, clear; drafts hold operator/value). Active headers have data-filtered and an accessible filtered suffix. Header tab order is sort, help, filter, resize. filterModel/defaultFilterModel/onFilterModelChange use QueryGroup; header edits replace all top-level conditions for a column in an and-group and preserve nested groups. Client evaluation uses column accessors and locale before sorting/grouping/paging; totals, selection and CSV use filtered rows. A model change requests page 1 and clears all-matching selection. Server mode renders supplied rows and emits one onQueryChange with filterModel and cause filter. Other query causes keep their payloads when the feature is unused. Saved views capture filterModel; older views restore defaultFilterModel. DataTableLabels supports filterColumn, filtered, applyFilter, filterAny, clearFilter, filterSearch, filterFrom and filterTo. See examples/header-filters.tsx for every editor, controlled state, views and server requests; newQueryId from the UI package is called only in event handlers. ' +
    'Opt-in renderDetail(row) adds a leading toggle and a full-width detail region, mounted only while expanded. hasDetail(row) limits eligibility. Use expandedDetailIds/onExpandedDetailIdsChange for controlled expansion or defaultExpandedDetailIds for initial state; ids persist across pages and sorting. detailExpandMode defaults to multiple; choose single for heavy panels. detailOnRowClick defaults to false and excludes controls, links and editor cells. Toggle buttons support Enter and Space, keep focus, and Tab continues through row controls into the panel. Details disable virtualization; virtualize=true warns in development, while auto stays off. Prefer pagination for large tables. Inline panels keep list context for payloads and errors; use a Drawer for longer independent workflows. See examples/expandable-rows.tsx for eligible failed rows, single mode, row clicks, initial expansion, controlled multiple panels and pinned/resizable columns. ' +
    'Opt-in editMode="row" edits every editable cell together. Edit focuses the first editor; Enter saves, Escape cancels and Tab moves without saving. Use editingRowIds/onEditingRowIdsChange or defaultEditingRowIds for multiple rows. Drafts are keyed by row id in DataTable and survive paging, sorting and virtualization. onRowSave receives {row, rowId, values, previous}; void/true accepts, false/string rejects with a row alert, and {fieldErrors} marks and describes each invalid editor. Thrown errors keep the draft. Column validate runs before row and cell callbacks. ' +
    'DataTableEditValue remains string|number|null: switch reports true/false text and date reports YYYY-MM-DD. Textarea uses Shift+Enter for a newline and Enter to commit. DatePicker uses Space to open its calendar and Enter to commit after selecting; Combobox owns Enter while choosing an option. renderEditor receives row, value, setValue, commit, cancel, error and inputProps (accessible name, invalid, description, autofocus); spread inputProps on the custom field. Custom commit saves a cell; in row mode setValue already updates the draft and commit leaves it pending for Save. ' +
    'Prefer onRowsSave when several rows can be edited: the StickyActionBar counts changed rows, validates all before one callback, keeps only rejected rows (a record keyed by row id with strings or fieldErrors), and Discard all restores drafts. onRowAdd enables one draft at newRowPosition (top by default), seeded by newRowDefaults. Defaults use column ids; validators and editable predicates receive these defaults as the new row, so provide fields those functions need. onRowAdd receives values and the consumer inserts the accepted row into rows. Cancel/Escape removes the draft and returns focus to Add row. onRowDelete appends Delete, asks for typed confirmation in ConfirmDestructive and waits for the callback; the consumer removes the row, and focus returns to the next actions trigger or the previous one. ' +
    'See examples/editable-rows.tsx for row and cell editors, custom input, field validation, partial bulk rejection, controlled paging, persistent virtual drafts, add and delete. The docs-only packages/ui/examples/data-table-field-array.tsx uses useFieldArray with Form from @gntik-ai/ui/forms, without a blocks runtime dependency on react-hook-form. InlineEditRow and InlineEditTable are deprecated in favour of this API. ' +
    'Client pagination accepts optional page/onPageChange and pageSize/onPageSizeChange controlled pairs without paginationMode. Uncontrolled tables start at defaultPage=1 and defaultPageSize=10. Controlled tables request navigation and size changes, then wait for the consumer to update props. Stale pages clamp for the rows and footer without emitting callbacks. Sorting and applying a saved view request page 1 once unless already there. Size changes request the page retaining the first visible row, and onQueryChange receives the next page and size together. rowCount is only valid with paginationMode="server". See examples/url-pagination.tsx for URLSearchParams, one history.pushState per action, and popstate restoration. ' +
    'autoPageSize defaults to false. With client pagination enabled it fills a parent with a definite height, fits floor(bodyHeight / rowHeight) whole rows (minimum 1), and reports size changes through onPageSizeChange. rowHeight defaults to 44 for comfortable density or 36 for compact. Automatic sizing owns page size even if pageSize is supplied, hides the footer size control and keeps the first visible row on screen. Its viewport excludes toolbar, header, visible caption and footer, and never measures tbody or row-count-dependent content. Without a definite height it falls back to defaultPageSize and warns in development. Supply page/onPageChange together if controlling its page. It does not enable pagination in single selection or change server pagination. See examples/auto-page-size.tsx for a resizable 480px parent. ' +
    'Optional column.description (ReactNode) adds an InfoTip after the label, outside the sort button. Use descriptions only for columns needing a definition, since each info button adds a keyboard stop. Enter or Space opens help; Escape closes it and returns focus without sorting. column.renderHeader (() => ReactNode) replaces only the visible label; use non-interactive content with aria-hidden icons. The required header string remains the column name for accessibility, the Columns menu, resize separators, editor labels and CSV export. With either field, the header cell is named by header; rich units do not change that name. Help follows the label for every alignment, and the label truncates before the help button shrinks. See examples/header-help.tsx for usage metrics with definitions, an icon and units. ' +
    'Optional npm-only useTableData<T, F> from @gntik-ai/blocks owns abortable, per-instance cached server requests. Copy-install DataTable items do not include the hook. Supply getRows({ page, pageSize, sort, filters, cursor, signal }) returning a Promise of { rows, rowCount } for numbered pages or { rows, nextCursor } for cursor lists. Wrap another fetcher in getRows, for example async ({ signal, ...query }) => { const response = await fetchPage(query, { signal }); return { rows: response.items, rowCount: response.total }; }. Spread tableProps into DataTable: rows, server pagination, rowCount, page, pageSize, sort, manualSorting, loading, filters for selection/saved views and the query callbacks are included. Requests start after commit, so synchronous resize and sort callbacks coalesce into one call. Saved views can clear sort through onQueryChange. Options default to initialPage=1, initialPageSize=20, initialSort=null, cacheTime=30000 ms, keepPreviousData=true, revalidateInterval=0 and enabled=true. Filters compare by JSON.stringify value (key-order sensitive); use serialisable values without cycles or BigInt. Dates and class instances compare by their JSON form. Changing filters or sort requests page 1; resizing preserves the page computed by DataTable to keep the first visible row on screen. Changing callback identities does not refetch. rows, rowCount, nextCursor, isLoading, isFetching, error and params expose the request state. Retained rows keep their confirmed page and pageSize until success, while params describes the requested page and sort reflects the requested order immediately, rolling back on failure. There is no built-in fetching cue over retained rows yet. keepPreviousData=false shows empty rows for an uncached pending query; the last known total remains. Rejections and synchronous throws retain the last rows and call the latest onError once; nullish failures become an Error with the message Unable to load rows. Aborts stay silent. refetch retries the current failed params and bypasses fresh cache; repeating a failed page callback also retries. invalidate clears cache and reloads after edits. Both explicit reloads abort and replace any active request; their cache bypass applies only to that reload. Fresh cache hits clear errors and skip fetching; expired entries render immediately with one background refresh; cacheTime=0 disables caching. Cache entries, including expired ones, remain until invalidation or unmount, so memory grows with distinct queries. revalidateInterval pauses while document.hidden or a request is active, and polls only confirmed queries: failed query changes or cursor appends need an explicit retry. enabled=false aborts work, restores the last confirmed rows and sort, and clears loading; unmount aborts and ignores later settles. For cursors, use paginated=false and spread loadMoreProps into a separate LoadMoreFooter; loadMore appends, repeated calls in flight are ignored, and onRetry retries the failed cursor. An upstream AbortError stays silent and the next loadMore retries the aborted cursor. After a query failure, loadMore waits for a successful retry so a new sort or filter cannot use an old cursor. A null or empty nextCursor exhausts the list. lastAppend increases only when a successful append adds a segment, never when re-enabling or refreshing an already displayed segment, and footer result/loading settle together. Background polls and expired-cache refreshes set isFetching without showing Loading more in the footer; loadMore still ignores calls while any request is active. Cursor refetch starts from the first page; background revalidation preserves the prefix instead of appending duplicates. After a deletion empties an out-of-range page, the consumer chooses whether to request the last valid page: DataTable only clamps the displayed footer. See examples/server-pagination.tsx for endpoint wrapping, selection and errors, and examples/cursor-load-more.tsx for filters, enabled, keepPreviousData, polling, cache invalidation and retry, including a failed refresh after exhaustion. ' +
    'Opt-in csvExport adds an Export menu: All rows in current sort order across pages (before grouping), Current page in grouped display order, Selected rows and Copy selected rows (also Ctrl/Cmd+C on non-editable table content without a document text selection). csvExport accepts fileName and scopes (rows/page/selected). The filename defaults to the slugged caption, or table.csv without a supplied caption. Visible exportable columns keep display order; exportValue overrides accessor (nullish results fall back), columns without either are omitted, and exportable=false opts out. Values stay raw: ISO dates, booleans, numbers and empty null cells. CSV includes a BOM; CSV and clipboard TSV both use shared toCsv formula protection for headers and values. Single selection exports selectedId; multiple selection resolves include/exclude models across loaded rows. onExport receives scope, exported column ids, selected ids, sort and opaque filters; while pending the trigger stays focusable and busy and repeat exports are ignored. Use onExport for large result sets, and handle errors in the callback. Server pagination requires onExport and labels All rows with rowCount; clipboard copying and its shortcut are unavailable in server mode because unloaded selections cannot be copied completely. See examples/csv-export.tsx for client, delegated server and single-row previews. ' +
    'Generic typed table: sortable headers with aria-sort, row selection with select-all and indeterminate by default (selectionMode="multiple"), selectionMode="none" to hide selection, column visibility menu, density toggle, row actions, loading and empty states, client-side sort and pagination, optional row groups (groupBy) with rowgroup header rows, counts, keyboard-accessible collapse buttons and group selection; column resize (pointer drag or a focusable role="separator" handle with arrow keys, min/max widths, controlled columnWidths), column pinning to either edge with sticky cells (column menu or pinnedColumns), row virtualization for large datasets (aria-rowcount/aria-rowindex, works with selection and grouping), inline cell editing (text, number and select editors; Enter/F2 to edit, Enter/Tab to commit, Escape to cancel, onCellEdit can reject with an inline error) and saved views (filters, sort, visible columns, widths, pinning and grouping) with a view switcher to save as, rename, delete and reset. ' +
    'Row headers: the body cells of one column render as th scope="row" (role rowheader) so a screen reader announces which row a value belongs to. The row-header column is the first column with rowHeader: true; otherwise the first column, unless it sets rowHeader: false, which turns row headers off. List pages whose first column is an icon or a status should set rowHeader on the name column. The cell keeps the density, alignment, variant, className, width and pinned classes of the td it replaces, in normal font weight. Hiding the row-header column leaves the row without one (no other column is promoted). The default getRowLabel (checkbox, radio, detail toggle and actions names) uses the row-header column. Group header rows (scope=rowgroup), loading and empty rows are unchanged. Consumer tests that query the first column as a cell now query rowheader; rowHeader: false restores td. See examples/row-header.tsx. ' +
    'Opt-in selectionMode="single" uses native radios in a labelled fieldset (never virtualized; client pagination defaults to false, and paginated=true or paginationMode="server" enables pagination). Single mode uses selectedId/onSelectedIdChange or defaultSelectedId; isRowDisabled skips unavailable rows and preserves a checked disabled choice without callbacks. Supply legend, aria-label or aria-labelledby for the group and getRowLabel for each radio (otherwise the first column labels it). selectionName is used verbatim and must be unique per page; omitted names use an instance-unique useId name, and duplicate supplied names or missing group labels warn in development. Tab enters once on the checked enabled row or first enabled row; arrows wrap and skip disabled rows, Space selects, Shift+Tab exits, and all-disabled groups have no tab stop. No select-all, group checkboxes, bulk actions or selection summary appear in single mode. ' +
    'Examples in examples/single-selection.tsx: an uncontrolled non-paginated list with legend="Available items" and a controlled versions table with legend="Available versions", selectedId="v2" and a checked disabled version. ' +
    'Opt-in paginationMode="server" accepts a controlled 1-based page, pageSize and required rowCount (known total), with onPageChange/onPageSizeChange requests. Supplied rows render in order without client sorting or slicing. Sortable columns show sort buttons and aria-sort when onSortChange or onQueryChange is supplied; without either, headers stay plain. Sorting toggles ascending/descending, updates uncontrolled sort (controlled sort waits for the prop), and requests page 1 when not already there. aria-sort reflects the requested order before rows arrive; reset controlled sort to the last confirmed order if a request fails. Saved views restore changed sort and request page 1; views that only change filters keep the current server page. Clearing sort is reported as null through onQueryChange, since onSortChange accepts only a non-null SortState. Single selection keeps its chosen id across pages. Off-page choices leave every visible radio unchecked and the first enabled radio is the tab stop; name the current choice in the legend. See examples/paginated-single-selection.tsx for client and server pagination. The footer stays visible for empty results, clamps stale pages for display without callbacks, and hides during loading. Page-size changes may also request a page to keep the first visible row on screen. The consumer owns fetching and reconciles stale pages. onQueryChange receives one synchronous DataTableQuery per user page, pageSize, sort or view action in both modes: { page, pageSize, sort, filters, cause }. It includes the next page and size together on resize, and the restored filters on a view; consumer filter prop changes do not emit queries. Use onQueryChange OR the separate callbacks for fetching to avoid duplicate requests; existing callbacks retain their order and arguments. See examples/server-pagination.tsx for sortable columns and one request per query, with controlled sort reset on failure. ' +
    'Multiple selection preserves ids from other server pages by default; preserveSelection=false restores page-only reporting, and client tables can opt in with preserveSelection=true. selectedIds remains supported. A controlled selectionModel takes precedence and uses { type: "include", ids: string[] } for selected ids or { type: "exclude", ids: string[] } for every match except those ids. bulkActions(ids, model) receives the full include list; in exclude mode ids contains enabled selections in the current rows and the model is authoritative. One-argument actions remain compatible. ' +
    'selectAllMatching defaults to false and offers a strip after the page is fully selected: client mode includes every enabled row, while server mode requires onSelectionModelChange and reports an exclude model. The same button becomes Clear selection without moving focus; clearing returns focus to the page checkbox, or to the table when the checkbox is hidden or unavailable. An exclude model resets through both callbacks when filters changes by JSON value; filters must include every narrowing input, including search text. Paging, page size and sorting preserve selection. An exclude action covers the matching result set at action time, including later-created rows; the consumer executes it. isRowDisabled disables multiple-selection checkboxes and page/group/all-matching toggles skip known disabled rows. Server counts use rowCount minus explicit excluded ids, including disabled ids on the page where Select all is activated. isRowDisabled cannot evaluate unloaded rows, so the server must enforce eligibility for the complete matching result set; return only eligible matches and their rowCount when counts must exclude all unavailable rows. hideSelectAll defaults to false and hides just the header checkbox, retaining an accessible Selection heading. See examples/client-selection.tsx for client preservation, disabled rows and select-all-matching, and examples/server-pagination.tsx for controlled models, cross-page actions and the preservation/header options. ' +
    'loading accepts true or "refresh". true replaces rows with skeleton rows, hides the footer and announces Loading. "refresh" keeps the current rows, selection (multiple and single), virtualization, scroll position and footer with every control enabled, sets aria-busy on the table and overlays an indeterminate kit Progress (size sm, no value, static under reduced motion) on the top edge of the body without changing the table height; rows keep full opacity. With no rows "refresh" renders exactly like true, so a first load never flashes an empty state. A polite status reads Updating {caption}… (labels.updating overrides it) only when the refresh follows a page, page-size, sort, filter or view request the table emitted; a refresh the caller starts alone, such as polling, sets aria-busy and the bar silently, and a request made during a silent refresh is announced. Actions on stale rows keep valid row ids, and the footer can show the requested page before its rows arrive. With no rows, filtered (default false) selects noResultsState, falling back to emptyState and then the default; with filtered false or unset the body shows emptyState or the default as before. filtered is an explicit flag and is not derived from filters. See examples/refresh-loading.tsx for a server table that refreshes between pages and polls every 10 seconds, with FirstRunEmpty and NoResultsEmpty. ' +
    'Optional quick filter: quickFilter/defaultQuickFilter/onQuickFilterChange hold a term that is trimmed and split on whitespace; a row matches when every term matches at least one searchable column (AND across terms, OR across columns), with matchText so case and accents are ignored (funcion finds Función). A column is searched by its accessor value as text and by its display text (the default cell text for the table locale), so ids, ISO dates and localized decimals are findable; columns that only render cell are skipped, and a column with no accessor is never searched. column.quickFilter: unset searches the column while it is visible, true also while it is hidden, false never, and a function (row, term) => boolean replaces the text match for that column and follows the visibility rule of unset. Client mode applies the term together with the filter model (AND) before sorting, grouping and paging, returns to page 1 on a change, and the footer total, export count, select-all and group counts follow the matching rows; a selected row that stops matching stays selected and is still reported by onSelectionChange. A non-empty term sets filtered, so an empty result shows noResultsState. Server mode never filters rows: each applied term goes to onQuickFilterChange and onQueryChange (quickFilter set, cause quickFilter) and onPageChange(1) is called when the page is not 1; changing the quickFilter prop emits no query. showQuickFilter (true or collapsible) renders a kit SearchField named Search {caption} at the start of the toolbar, which stays mounted while rows are selected so focus is never lost. quickFilterDebounceMs (default 300) applies typing after the last key; Enter applies at once and Escape clears at once. collapsible starts as a search button with aria-expanded false; activating it shows and focuses the field, Escape or blur in the empty field collapses it again (Escape returns focus to the button) and a non-empty term keeps it open. A polite status reads {count} rows match after each applied term and does not change while typing. Search either in the table or in the page, not both: a page that also filters rows filters twice. Saved views do not capture the term. quickFilterRows(rows, columns, term, hiddenColumnIds, { locale }) is exported for the same matching outside the table, for example to export exactly the rows a quick-filtered table shows; QuickFilterOptions types its options. See examples/quick-filter.tsx for a client table, a collapsible one, a server table reporting the term, and FilterBar queryDebounceMs and PageToolbar searchDebounceMs. ' +
    'Row activation: getRowHref(row) renders a kit Link in the row-header cell (or the first visible column when the header is absent or hidden). The identifying column must not be editable: cell and row editors take precedence over its link or button. Plain content clicks activate that element through LinkProvider; undefined destinations stay inert. onRowClick(row, event) runs once before navigation and preventDefault cancels it. Without getRowHref, onRowClick renders a link-styled button reachable by Tab, Enter and Space. Ctrl/Cmd and middle row clicks call onRowClick before opening the href in a new tab with noopener; preventDefault cancels opening the tab. Controls, inline editors, data-row-click-ignore and clicks ending a text selection stay independent. onRowDoubleClick(row, event) is a pointer accelerator: its action must also be reachable through the row link, onRowClick or rowActions. No focus stop is added to tr. selectOnRowClick toggles multiple selection or selects the single radio, skipping disabled rows. When both selection and detail row clicks are enabled, selection takes precedence, including on disabled rows; the detail toggle stays available. getRowHref or onRowClick takes precedence over selectOnRowClick and detailOnRowClick, with one development warning naming the ignored props. ' +
    'Pass ref: Ref<DataTableHandle> to call scrollToRow(id, { align?: auto | start | center | end, focus?: boolean }). It returns false for an unknown id without changing anything, otherwise true and reveals the listed row. Client tables request its page through onPageChange and expand a collapsed group through onCollapsedGroupsChange; controlled props must update before scrolling completes. Every new scrollToRow call cancels the previous pending reveal, including a call for an unknown id. A subsequent pointer, keyboard or click interaction also cancels a pending reveal, so delayed controlled updates do not move focus after the user moves on. Server mode searches only the supplied rows and never fetches another page. Scrolling is instant, including virtualized offsets; focus moves to the first row control only when requested. See examples/row-activation.tsx for href navigation cancellation, keyboard callbacks, the double-click alternative, both selection modes, and paged/grouped and virtual scroll handles.',

  labels: [
    {
      key: 'quickFilter',
      type: '(caption: string) => string',
      state: 'showQuickFilter: field and collapsed button name',
    },
    { key: 'quickFilterResults', type: '(count: number) => string', state: 'showQuickFilter: polite match count' },
    { key: 'details', type: 'string', state: 'Detail toggle column: screen reader heading' },
    { key: 'rowDetails', type: '(label: string) => string', state: 'Detail toggle and region accessible name' },
    { key: 'editRow', type: '(label: string) => string', state: 'Row mode: Edit button name' },
    { key: 'saveRow', type: 'string', state: 'Row or new-row draft: Save button' },
    { key: 'rowsChanged', type: '(count: number) => string', state: 'Bulk bar: changed row count' },
    { key: 'saveAll', type: 'string', state: 'Bulk bar: Save all button' },
    { key: 'discardAll', type: 'string', state: 'Bulk bar: Discard all button' },
    { key: 'addRow', type: 'string', state: 'Add row button and new-row editor name' },
    { key: 'deleteRow', type: 'string', state: 'Delete menu item and confirming button' },
    { key: 'deleteRowTitle', type: '(label: string) => string', state: 'Delete confirmation: dialog title' },
    { key: 'deleteRowDescription', type: '(label: string) => string', state: 'Delete confirmation: description' },
    { key: 'export', type: 'string', state: 'CSV export menu trigger text and name' },
    { key: 'exportAll', type: '(count: number) => string', state: 'CSV all rows item; server mode uses rowCount' },
    { key: 'exportPage', type: 'string', state: 'CSV current page item' },
    { key: 'exportSelected', type: '(count: number) => string', state: 'CSV selected rows item, only with selection' },
    { key: 'copySelected', type: 'string', state: 'Copy selected rows menu item, only with selection' },
    { key: 'copiedToClipboard', type: 'string', state: 'Polite status after copying selected rows' },
    { key: 'copyFailed', type: 'string', state: 'Polite status after clipboard failure' },
    { key: 'booleanTrue', type: 'string', state: 'Default cell text for a true boolean value' },
    { key: 'booleanFalse', type: 'string', state: 'Default cell text for a false boolean value' },
    {
      key: 'scrollRegion',
      type: 'string',
      state: 'Non-virtual table overflow: focusable scroll region name; virtualized regions use the caller caption',
    },
    {
      key: 'selectionCount',
      type: '(count: number) => string',
      state: 'Multiple selection: toolbar count and polite live region',
    },
    {
      key: 'pageSelected',
      type: '(count: number) => string',
      state: 'Matching-selection strip: selected page announcement',
    },
    {
      key: 'selectAllMatching',
      type: '(count: number) => string',
      state: 'Matching-selection strip: select every enabled match',
    },
    {
      key: 'allMatchingSelected',
      type: '(count: number) => string',
      state: 'Matching-selection strip: all-matching announcement',
    },
    { key: 'clearSelection', type: 'string', state: 'Matching-selection strip: clear action' },
    { key: 'columns', type: 'string', state: 'Column visibility trigger text and name' },
    { key: 'visibleColumns', type: 'string', state: 'Open column menu: visibility heading' },
    { key: 'pinColumns', type: 'string', state: 'Open column menu with pinning: pin heading' },
    { key: 'pinnedLeft', type: 'string', state: 'Open pin submenu trigger: left side suffix' },
    { key: 'pinnedRight', type: 'string', state: 'Open pin submenu trigger: right side suffix' },
    { key: 'pinLeft', type: 'string', state: 'Open pin submenu: left option' },
    { key: 'pinRight', type: 'string', state: 'Open pin submenu: right option' },
    { key: 'unpinned', type: 'string', state: 'Open pin submenu: unpinned option' },
    { key: 'density', type: 'string', state: 'Density group accessible name' },
    { key: 'comfortable', type: 'string', state: 'Comfortable density button name' },
    { key: 'compact', type: 'string', state: 'Compact density button name' },
    {
      key: 'resizeColumn',
      type: '(label: string) => string',
      state: 'Resizable header: separator name; label is caller column header',
    },
    {
      key: 'columnWidth',
      type: '(width: number) => string',
      state: 'Resizable header: separator aria-valuetext in pixels',
    },
    { key: 'defaultView', type: 'string', state: 'View trigger when no active view' },
    { key: 'defaultViewOption', type: 'string', state: 'Open views menu: default option' },
    { key: 'modified', type: 'string', state: 'Dirty view trigger: screen reader suffix' },
    { key: 'views', type: 'string', state: 'Open views menu: heading' },
    { key: 'saveChanges', type: 'string', state: 'Open views menu: save current view action' },
    { key: 'saveAs', type: 'string', state: 'Open views menu: save as action' },
    { key: 'renameView', type: 'string', state: 'Open views menu: rename action' },
    { key: 'deleteView', type: 'string', state: 'Open views menu: immediate delete action; no confirmation dialog' },
    { key: 'resetChanges', type: 'string', state: 'Open views menu: reset action' },
    { key: 'saveViewTitle', type: 'string', state: 'Save as dialog: title and accessible name' },
    { key: 'renameViewTitle', type: 'string', state: 'Rename dialog: title and accessible name' },
    { key: 'viewName', type: 'string', state: 'Save as and Rename dialogs: input label' },
    { key: 'cancel', type: 'string', state: 'Save as and Rename dialogs: cancel button' },
    { key: 'saveView', type: 'string', state: 'Save as dialog: submit button' },
    { key: 'rename', type: 'string', state: 'Rename dialog: submit button' },
    { key: 'closeDialog', type: 'string', state: 'Save as and Rename dialogs: close button name' },
    { key: 'selection', type: 'string', state: 'Single selection or hideSelectAll: screen reader column heading' },
    { key: 'selectAll', type: 'string', state: 'Multiple selection: header checkbox name' },
    {
      key: 'selectRow',
      type: '(label: string) => string',
      state: 'Multiple selection: row checkbox name; label is caller row name',
    },
    { key: 'selectGroup', type: '(group: string) => string', state: 'Grouped multiple selection: group checkbox name' },
    {
      key: 'groupRows',
      type: '(count: number) => string',
      state: 'Grouped header: screen reader row-count unit; numeric count stays unchanged',
    },
    { key: 'noGroup', type: 'string', state: 'Grouped header: fallback when group key is empty' },
    { key: 'actions', type: 'string', state: 'Row actions present: screen reader column heading' },
    {
      key: 'rowActions',
      type: '(label: string) => string',
      state: 'Row action menu trigger name; label is caller row name',
    },
    { key: 'emptyTitle', type: 'string', state: 'Empty rows: default empty-state title' },
    { key: 'emptyDescription', type: 'string', state: 'Empty rows: default empty-state description' },
    {
      key: 'loading',
      type: '(caption: string) => string',
      state: 'Loading: status announcement; receives original caller caption',
    },
    {
      key: 'updating',
      type: '(caption: string) => string',
      state: 'Refresh after a table request: polite status and progress bar name; receives original caller caption',
    },
    { key: 'editHint', type: 'string', state: 'Editable table: shared keyboard instruction description' },
    { key: 'editLabel', type: '(column: string, row: string) => string', state: 'Editing cell: input accessible name' },
    { key: 'editError', type: 'string', state: 'Rejected cell edit without caller error message: alert' },
    { key: 'enterNumber', type: 'string', state: 'Editing number: invalid numeric value alert' },
    { key: 'minimumValue', type: '(min: number) => string', state: 'Editing number below minimum: alert' },
    { key: 'maximumValue', type: '(max: number) => string', state: 'Editing number above maximum: alert' },
    { key: 'rowsPerPage', type: 'string', state: 'Footer shown without autoPageSize: visible page-size text' },
    {
      key: 'rowsPerPageLabel',
      type: 'string',
      state: 'Footer shown without autoPageSize: page-size Select accessible name',
    },
    {
      key: 'rangeSummary',
      type: '(from: number, to: number, total: number) => string',
      state: 'Every page and page-size change: visible summary and polite live region',
    },
    {
      key: 'paginationNav',
      type: '(noun: string) => string',
      state: 'Always: navigation accessible name; noun is the caller caption',
    },
    { key: 'previous', type: 'string', state: 'Always: previous-page button name' },
    { key: 'next', type: 'string', state: 'Always: next-page button name' },
    {
      key: 'page',
      type: '(page: number) => string',
      state: 'Always: numbered-page button name; number stays caller content',
    },
  ] satisfies Array<{ key: keyof DataTableLabels; type: string; state: string }>,
  registryDependencies: [
    'info-tip',
    'kanban-board',
    'live-announcer',
    'sticky-action-bar',
    'confirm-destructive',
    'popover',
    'date-picker',
    'number-input',
    'radio-group',
    'empty-states',
  ],
  uses: [
    'Table',
    'IconButton',
    'LiveAnnouncer',
    'Link',
    'InfoTip',
    'Checkbox',
    'Menu',
    'MoreMenu',
    'ToggleGroup',
    'Button',
    'Skeleton',
    'Progress',
    'EmptyState',
    'Pagination',
    'SimpleSelect',
    'StatusTag',
    'Input',
    'Textarea',
    'Switch',
    'DatePicker',
    'DateRangePicker',
    'NumberInput',
    'RadioGroup',
    'Popover',
    'Combobox',
    'StickyActionBar',
    'ConfirmDestructive',
    'Dialog',
  ],
};
