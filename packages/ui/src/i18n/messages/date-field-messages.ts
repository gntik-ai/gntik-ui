export const dateFieldEn = {
  'dateField.label': 'Date',
  'dateField.year': 'Year',
  'dateField.month': 'Month',
  'dateField.day': 'Day',
  'dateField.start': 'Start date',
  'dateField.end': 'End date',
  'dateField.segmentInRange': '{range}, {segment}',
  'datePicker.startDate': 'Start date',
  'datePicker.editableHint': 'Type or paste a date. Alt+ArrowDown opens the calendar.',
  'datePicker.editableTimeHint': 'Enter a UTC date and time, including AM or PM.',
  'datePicker.endDate': 'End date',
} as const;

export const dateFieldEs = {
  'dateField.label': 'Fecha',
  'dateField.year': 'Año',
  'dateField.month': 'Mes',
  'dateField.day': 'Día',
  'dateField.start': 'Fecha de inicio',
  'dateField.end': 'Fecha de fin',
  'dateField.segmentInRange': '{range}, {segment}',
  'datePicker.startDate': 'Fecha de inicio',
  'datePicker.editableHint': 'Escribe o pega una fecha. Alt+Flecha abajo abre el calendario.',
  'datePicker.editableTimeHint': 'Introduce una fecha y hora UTC, incluyendo a. m. o p. m.',
  'datePicker.endDate': 'Fecha de fin',
} satisfies Record<keyof typeof dateFieldEn, string>;
