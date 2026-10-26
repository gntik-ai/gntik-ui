/** Table toolbar menu labels, shared by the English and Spanish catalogs. */
export const tableMenuEn = {
  'table.columns': 'Columns',
  'table.export': 'Export',
  'table.exportAll': 'All rows ({count})',
  'table.exportPage': 'Current page',
  'table.exportSelected': 'Selected rows ({count})',
  'table.copySelected': 'Copy selected rows',
  'table.visibleColumns': 'Visible columns',
  'table.density': 'Row density',
  'table.comfortable': 'Comfortable rows',
  'table.compact': 'Compact rows',
  'table.editRow': 'Edit {label}',
} as const;

export const tableMenuEs = {
  'table.columns': 'Columnas',
  'table.export': 'Exportar',
  'table.exportAll': 'Todas las filas ({count})',
  'table.exportPage': 'Página actual',
  'table.exportSelected': 'Filas seleccionadas ({count})',
  'table.copySelected': 'Copiar filas seleccionadas',
  'table.visibleColumns': 'Columnas visibles',
  'table.density': 'Densidad de filas',
  'table.comfortable': 'Filas holgadas',
  'table.compact': 'Filas compactas',
  'table.editRow': 'Editar {label}',
} satisfies Record<keyof typeof tableMenuEn, string>;
