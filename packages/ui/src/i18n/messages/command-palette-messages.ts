export const commandPaletteEn = {
  'commandPalette.loadFailed': 'Couldn’t load results.',
  'commandPalette.showing': 'Showing {shown} of {total}',
  'commandPalette.examples.openFromButton': 'Open from a button',
  'commandPalette.examples.queryLabel': 'Query',
  'commandPalette.examples.chosenLabel': 'Chosen',
  'commandPalette.examples.asyncHelp':
    'Type two letters (“agent”, “run”) to search the server; “fail” shows the error and Retry.',
  'commandPalette.examples.customRowsHelp':
    'The footer reads “Showing 50 of 120”; only ids that start with the query match.',
} as const;

export const commandPaletteEs = {
  'commandPalette.loadFailed': 'No se pudieron cargar los resultados.',
  'commandPalette.showing': 'Mostrando {shown} de {total}',
  'commandPalette.examples.openFromButton': 'Abrir desde un botón',
  'commandPalette.examples.queryLabel': 'Consulta',
  'commandPalette.examples.chosenLabel': 'Elegido',
  'commandPalette.examples.asyncHelp':
    'Escribe dos letras (“agent”, “run”) para buscar en el servidor; “fail” muestra el error y Reintentar.',
  'commandPalette.examples.customRowsHelp':
    'El pie dice «Mostrando 50 de 120»; solo coinciden los ids que empiezan por la consulta.',
} satisfies Record<keyof typeof commandPaletteEn, string>;
