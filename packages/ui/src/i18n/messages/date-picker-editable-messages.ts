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
  'datePicker.examples.expiresOn': 'Expires on',
  'datePicker.examples.in7': 'In 7 days',
  'datePicker.examples.in30': 'In 30 days',
  'datePicker.examples.endOfQuarter': 'End of quarter',
  'datePicker.examples.noExpiry': 'No expiry',
  'datePicker.examples.hint': 'Pick a shortcut or an exact day.',
  'datePicker.examples.expiresAt': 'Expires at',
  'datePicker.examples.limitsHint':
    'Presets keep the time and the popup stays open until Done. In 30 days is disabled: it falls after the latest allowed day.',
  'datePicker.examples.pickedPreset': 'Picked the "{id}" shortcut.',
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
  'datePicker.examples.expiresOn': 'Caduca el',
  'datePicker.examples.in7': 'En 7 días',
  'datePicker.examples.in30': 'En 30 días',
  'datePicker.examples.endOfQuarter': 'Fin del trimestre',
  'datePicker.examples.noExpiry': 'Sin caducidad',
  'datePicker.examples.hint': 'Elige un atajo o un día exacto.',
  'datePicker.examples.expiresAt': 'Caduca a las',
  'datePicker.examples.limitsHint':
    'Los atajos conservan la hora y el panel sigue abierto hasta Listo. En 30 días está desactivado: cae después del último día permitido.',
  'datePicker.examples.pickedPreset': 'Atajo «{id}» elegido.',
} satisfies Record<keyof typeof datePickerEditableEn, string>;
