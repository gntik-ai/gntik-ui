export const dateRangeExamplesEn = {
  'datePicker.examples.retentionLabel': 'Report period',
  'datePicker.examples.retentionHint':
    'Pick 3 to 90 calendar days, including both ends. Days outside the limits are unavailable after picking a start.',
  'datePicker.examples.pendingStart': 'Start picked: {date}. Pick an end for a range of 3 to 90 calendar days.',
  'calendar.examples.rangeLimits': 'Pick a range of 3 to 7 calendar days, including both ends.',
  'calendar.examples.sameMonth': 'Pick a start, then an end in the same month.',
} as const;

export const dateRangeExamplesEs = {
  'datePicker.examples.retentionLabel': 'Periodo del informe',
  'datePicker.examples.retentionHint':
    'Elige de 3 a 90 días naturales, incluidos ambos extremos. Las fechas fuera de los límites no están disponibles tras elegir el inicio.',
  'datePicker.examples.pendingStart': 'Inicio elegido: {date}. Elige un fin para un rango de 3 a 90 días naturales.',
  'calendar.examples.rangeLimits': 'Elige un rango de 3 a 7 días naturales, incluidos ambos extremos.',
  'calendar.examples.sameMonth': 'Elige un inicio y luego un fin en el mismo mes.',
} satisfies Record<keyof typeof dateRangeExamplesEn, string>;
