import type { PaginationFooterLabels } from '../PaginationFooter/labels';
import type { FilterBarLabels } from '../FilterBar/labels';
import type { DataTableLabels } from '../DataTable/labels';

type Complete<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends (...args: never[]) => unknown
    ? NonNullable<T[K]>
    : NonNullable<T[K]> extends object
      ? Complete<NonNullable<T[K]>>
      : NonNullable<T[K]>;
};

// Independent, full en/es label sets. Caller content uses A/B/G throughout the matrix.
export const paginationLabels = {
  en: {
    rowsPerPage: 'Rows per page',
    pagination: (noun: string) => `${noun} pagination`,
    previous: 'Previous page',
    next: 'Next page',
    page: (n: number) => `Page ${n}`,
    rangeSummary: (from: number, to: number, total: number) => `${from}–${to} of ${total}`,
  },
  es: {
    rowsPerPage: 'Filas por página',
    pagination: (noun: string) => `Paginación de ${noun}`,
    previous: 'Anterior',
    next: 'Siguiente',
    page: (n: number) => `Página ${n}`,
    rangeSummary: (from: number, to: number, total: number) => `${from} a ${to}; total ${total}`,
  },
} satisfies Record<'en' | 'es', Complete<PaginationFooterLabels>>;
export const filterLabels = {
  en: {
    region: 'Filters',
    search: 'Search',
    placeholder: 'Search by name…',
    savedView: 'Saved view',
    savedViews: 'Saved views',
    addFilter: 'Add filter',
    activeFilters: 'Active filters',
    filters: 'Filters',
    clearAll: 'Clear all',
    removeFilter: (field: string, value: string) => `Remove filter ${field}: ${value}`,
    resultCount: (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`,
  },
  es: {
    region: 'Consulta',
    search: 'Buscar',
    placeholder: 'Busca por nombre…',
    savedView: 'Vista guardada',
    savedViews: 'Vistas guardadas',
    addFilter: 'Añadir condición',
    activeFilters: 'Condiciones activas',
    filters: 'Condiciones',
    clearAll: 'Vaciar',
    removeFilter: (field: string, value: string) => `Quitar ${field}: ${value}`,
    resultCount: (n: number) => `${n} ${n === 1 ? 'coincidencia' : 'coincidencias'}`,
  },
} satisfies Record<'en' | 'es', Complete<FilterBarLabels>>;
export const tableLabels = {
  en: {
    columnMenu: {
      trigger: 'Columns',
      visibleColumns: 'Visible columns',
      pinColumns: 'Pin columns',
      pinSide: (side: 'left' | 'right') => (side === 'left' ? 'Left' : 'Right'),
      pinLeft: 'Pin left',
      pinRight: 'Pin right',
      unpinned: 'Unpinned',
    },
    density: { label: 'Row density', comfortable: 'Comfortable rows', compact: 'Compact rows' },
    views: {
      defaultView: 'Default view',
      modified: '(modified)',
      heading: 'Views',
      saveChanges: 'Save changes',
      saveAs: 'Save as new view…',
      renameView: 'Rename view…',
      deleteView: 'Delete view',
      resetChanges: 'Reset changes',
      saveTitle: 'Save view',
      renameTitle: 'Rename view',
      name: 'View name',
      cancel: 'Cancel',
      save: 'Save view',
      rename: 'Rename',
      close: 'Close',
    },
    selection: {
      heading: 'Selection',
      selectAll: 'Select all rows on this page',
      selectRow: (label: string) => `Select ${label}`,
      selectedCount: (n: number) => `${n} selected`,
    },
    actions: { heading: 'Actions', rowActions: (label: string) => `Actions for ${label}` },
    loading: (caption: string) => `Loading ${caption.toLowerCase()}…`,
    editHint: 'Press Enter or F2 to edit.',
    grouping: {
      noGroup: 'No group',
      groupRowCount: (n: number) => `${n} ${n === 1 ? 'row' : 'rows'}`,
      selectGroup: (name: string) => `Select all in ${name}`,
    },
    empty: { title: 'No results', description: 'Nothing matches the current filters.' },
    resize: { column: (header: string) => `Resize ${header} column`, value: (width: number) => `${width} pixels` },
    edit: {
      label: (header: string, row: string) => `${header} for ${row}`,
      invalidNumber: 'Enter a number.',
      minimum: (n: number) => `Enter ${n} or more.`,
      maximum: (n: number) => `Enter ${n} or less.`,
      saveError: 'The change could not be saved.',
    },
    scrollContainer: 'Scrollable table',
    pagination: paginationLabels.en,
  },
  es: {
    columnMenu: {
      trigger: 'Columnas',
      visibleColumns: 'Columnas visibles',
      pinColumns: 'Fijar columnas',
      pinSide: (side: 'left' | 'right') => (side === 'left' ? 'Izquierda' : 'Derecha'),
      pinLeft: 'Fijar izquierda',
      pinRight: 'Fijar derecha',
      unpinned: 'Sin fijar',
    },
    density: { label: 'Densidad', comfortable: 'Filas amplias', compact: 'Filas compactas' },
    views: {
      defaultView: 'Vista inicial',
      modified: '(cambiada)',
      heading: 'Vistas',
      saveChanges: 'Guardar cambios',
      saveAs: 'Guardar otra vista…',
      renameView: 'Cambiar nombre…',
      deleteView: 'Eliminar vista',
      resetChanges: 'Restablecer cambios',
      saveTitle: 'Guardar vista',
      renameTitle: 'Cambiar nombre',
      name: 'Nombre de vista',
      cancel: 'Cancelar',
      save: 'Guardar vista',
      rename: 'Renombrar',
      close: 'Cerrar',
    },
    selection: {
      heading: 'Selección',
      selectAll: 'Seleccionar esta página',
      selectRow: (label: string) => `Elegir ${label}`,
      selectedCount: (n: number) => `${n} elegidos`,
    },
    actions: { heading: 'Acciones', rowActions: (label: string) => `Acciones de ${label}` },
    loading: (caption: string) => `Cargando ${caption}…`,
    editHint: 'Pulsa Intro o F2 para editar.',
    grouping: {
      noGroup: 'Sin grupo',
      groupRowCount: (n: number) => `${n} ${n === 1 ? 'fila' : 'filas'}`,
      selectGroup: (name: string) => `Elegir grupo ${name}`,
    },
    empty: { title: 'Sin resultados', description: 'Ninguna coincidencia con los filtros.' },
    resize: { column: (header: string) => `Ajustar columna ${header}`, value: (width: number) => `${width} píxeles` },
    edit: {
      label: (header: string, row: string) => `${header} de ${row}`,
      invalidNumber: 'Escribe un número.',
      minimum: (n: number) => `Mínimo ${n}.`,
      maximum: (n: number) => `Máximo ${n}.`,
      saveError: 'No se pudo guardar.',
    },
    scrollContainer: 'Tabla desplazable',
    pagination: paginationLabels.es,
  },
} satisfies Record<'en' | 'es', Complete<DataTableLabels>>;
