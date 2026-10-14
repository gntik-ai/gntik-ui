import type { DataTableLabels, FilterBarLabels, PaginationFooterLabels } from '../../../../packages/blocks/src/tables';

type Full<T> = { [K in keyof T]-?: Required<NonNullable<T[K]>> };
export type FormatterCall = { key: string; args: readonly (number | string)[] };

/** Deliberately different from defaults even in en: exposes an ignored override. */
export function labelFixture(locale: 'en' | 'es', record: (call: FormatterCall) => void = () => {}) {
  const es = locale === 'es';
  const format = (key: string, ...args: (number | string)[]) => {
    record({ key, args });
    return `${es ? 'ES' : 'EN'}[${key}:${args.join('|')}]`;
  };
  const pagination = {
    rowsPerPage: es ? 'Filas mostradas' : 'Rows shown',
    rowsPerPageLabel: es ? 'Cantidad de filas' : 'Row quantity',
    range: (from: number, to: number, total: number) => format('range', from, to, total),
    nav: es ? 'Navegar páginas' : 'Browse pages',
    previous: es ? 'Retroceder' : 'Go backward',
    next: es ? 'Avanzar' : 'Go forward',
    page: (n: number) => format('page', n),
  } satisfies Required<PaginationFooterLabels>;
  const filters = {
    searchRegion: es ? 'Búsqueda de registros' : 'Record search',
    searchLabel: es ? 'Buscar registros' : 'Find records',
    placeholder: es ? 'Escriba un nombre…' : 'Type a name…',
    savedViewLabel: es ? 'Vista elegida' : 'Chosen view',
    savedViewPlaceholder: es ? 'Elegir una vista' : 'Choose a view',
    addFilter: es ? 'Añadir condición' : 'Add condition',
    filtersHeading: es ? 'Condiciones' : 'Conditions',
    activeFilters: es ? 'Condiciones activas' : 'Active conditions',
    remove: (field: string, value: string) => format('remove', field, value),
    clearAll: es ? 'Limpiar condiciones' : 'Clear conditions',
    results: (count: number) => format('results', count),
  } satisfies Required<FilterBarLabels>;
  const table = {
    views: {
      defaultView: es ? 'Vista predeterminada' : 'Original view',
      modified: es ? '(cambiada)' : '(changed)',
      heading: es ? 'Vistas guardadas' : 'Stored views',
      saveChanges: es ? 'Guardar cambios de vista' : 'Store view changes',
      saveAs: es ? 'Crear otra vista…' : 'Create another view…',
      rename: es ? 'Cambiar nombre de vista…' : 'Change view name…',
      delete: es ? 'Eliminar esta vista' : 'Remove this view',
      reset: es ? 'Restablecer vista' : 'Restore view',
      saveTitle: es ? 'Crear vista' : 'Create view',
      renameTitle: es ? 'Cambiar nombre' : 'Change name',
      nameLabel: es ? 'Nombre de la vista' : 'Name of view',
      cancel: es ? 'Cancelar edición' : 'Cancel editing',
      saveButton: es ? 'Guardar vista nueva' : 'Store new view',
      renameButton: es ? 'Guardar nombre' : 'Store name',
      close: es ? 'Cerrar ventana' : 'Close window',
    },
    columnMenu: {
      trigger: es ? 'Elegir columnas' : 'Choose columns',
      visibleColumns: es ? 'Columnas mostradas' : 'Shown columns',
      pinColumns: es ? 'Fijación de columnas' : 'Column pinning',
      left: es ? 'Izquierda' : 'Left edge',
      right: es ? 'Derecha' : 'Right edge',
      pinLeft: es ? 'Fijar a izquierda' : 'Pin to left edge',
      pinRight: es ? 'Fijar a derecha' : 'Pin to right edge',
      unpinned: es ? 'Sin fijación' : 'No pin',
      resize: (column: string) => format('resize', column),
      resizeValue: (width: number) => format('resizeValue', width),
    },
    density: {
      label: es ? 'Densidad de filas' : 'Density of rows',
      comfortable: es ? 'Filas amplias' : 'Spacious rows',
      compact: es ? 'Filas reducidas' : 'Small rows',
    },
    selection: {
      selected: (count: number) => format('selected', count),
      selectAll: es ? 'Elegir todas las filas' : 'Choose every row',
      row: (label: string) => format('row', label),
      group: (name: string) => format('group', name),
      heading: es ? 'Elección' : 'Chosen rows',
      actionsHeading: es ? 'Operaciones' : 'Operations',
      rowActions: (label: string) => format('rowActions', label),
    },
    status: {
      caption: es ? 'Registros' : 'Records',
      loading: (caption: string) => format('loading', caption),
      emptyTitle: es ? 'Sin registros' : 'No records',
      emptyDescription: es ? 'No hay coincidencias' : 'No matching records',
      noGroup: es ? 'Sin grupo' : 'Ungrouped',
      groupCount: (count: number) => format('groupCount', count),
      groupRows: (count: number) => format('groupRows', count),
      scrollable: es ? 'Tabla desplazable' : 'Table viewport',
      editHint: es ? 'Pulse Intro o F2 para editar' : 'Use Enter or F2 to edit',
      editLabel: (column: string, row: string) => format('editLabel', column, row),
      saveError: es ? 'No se pudo guardar' : 'Unable to store change',
      enterNumber: es ? 'Introduzca un número' : 'Provide a number',
      minNumber: (min: number) => format('minNumber', min),
      maxNumber: (max: number) => format('maxNumber', max),
    },
    pagination,
  } satisfies Full<DataTableLabels>;
  return { pagination, filters, table };
}
