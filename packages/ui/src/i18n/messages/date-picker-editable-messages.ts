export const datePickerEditableEn = {
  'datePicker.startDate': 'Start date',
  'datePicker.endDate': 'End date',
  'datePicker.examples.keyExpiry': 'Key expires on',
  'datePicker.examples.keyExpiryHint':
    'Type a date or choose it in the calendar; a pasted ISO date fills every segment.',
  'datePicker.examples.runAtUtc': 'Run at (UTC)',
  'datePicker.examples.runAtUtcHint': 'Date and time typed on the UTC wall clock, whatever the browser zone.',
  'datePicker.examples.auditWindow': 'Audit window',
  'datePicker.examples.auditWindowHint': 'An end before the start is marked invalid and not reported.',
  'datePicker.examples.typedValue': 'Value: {value}',
  'datePicker.examples.noValue': 'No value',
  'dateField.examples.utcLabel': 'Maintenance start (UTC)',
} as const;

export const datePickerEditableEs = {
  'datePicker.startDate': 'Fecha de inicio',
  'datePicker.endDate': 'Fecha de fin',
  'datePicker.examples.keyExpiry': 'La clave caduca el',
  'datePicker.examples.keyExpiryHint':
    'Escribe una fecha o elígela en el calendario; una fecha ISO pegada rellena todos los segmentos.',
  'datePicker.examples.runAtUtc': 'Ejecutar a las (UTC)',
  'datePicker.examples.runAtUtcHint': 'Fecha y hora escritas en el reloj UTC, sea cual sea la zona del navegador.',
  'datePicker.examples.auditWindow': 'Ventana de auditoría',
  'datePicker.examples.auditWindowHint': 'Un fin anterior al inicio se marca como no válido y no se comunica.',
  'datePicker.examples.typedValue': 'Valor: {value}',
  'datePicker.examples.noValue': 'Sin valor',
  'dateField.examples.utcLabel': 'Inicio del mantenimiento (UTC)',
} satisfies Record<keyof typeof datePickerEditableEn, string>;
