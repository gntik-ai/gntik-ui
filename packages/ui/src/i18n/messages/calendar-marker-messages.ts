export const calendarMarkerExamplesEn = {
  'calendar.examples.markers': 'Run outcomes by day. Paging to another month simulates loading its data.',
  'calendar.examples.markers.failed': '{count, plural, one {# failed run} other {# failed runs}}',
  'calendar.examples.markers.passed': '{count, plural, one {# passed run} other {# passed runs}}',
  'calendar.examples.markers.maintenance': 'Maintenance',
  'calendar.examples.markers.review': 'Review due',
  'calendar.examples.markers.skipped': '{count, plural, one {# skipped run} other {# skipped runs}}',
  'calendar.examples.markers.window': 'Release window',
  'calendar.examples.markers.renderDay': 'Runs per day with a custom day cell.',
} as const;

export const calendarMarkerExamplesEs = {
  'calendar.examples.markers': 'Resultados de ejecuciones por día. Cambiar de mes simula la carga de sus datos.',
  'calendar.examples.markers.failed': '{count, plural, one {# ejecución fallida} other {# ejecuciones fallidas}}',
  'calendar.examples.markers.passed': '{count, plural, one {# ejecución correcta} other {# ejecuciones correctas}}',
  'calendar.examples.markers.maintenance': 'Mantenimiento',
  'calendar.examples.markers.review': 'Revisión pendiente',
  'calendar.examples.markers.skipped': '{count, plural, one {# ejecución omitida} other {# ejecuciones omitidas}}',
  'calendar.examples.markers.window': 'Ventana de lanzamiento',
  'calendar.examples.markers.renderDay': 'Ejecuciones por día con una celda de día personalizada.',
} satisfies Record<keyof typeof calendarMarkerExamplesEn, string>;
