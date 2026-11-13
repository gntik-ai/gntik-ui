export const datePickerPeriodEn = {
  'datePicker.quarter': 'Q{quarter} {year}',
  'datePicker.examples.billingMonth': 'Billing month',
  'datePicker.examples.billingMonthHint': 'Submits the first day of the month.',
  'datePicker.examples.payrollWeek': 'Payroll week',
  'datePicker.examples.payrollWeekHint': 'Weeks start on Monday here; the value follows weekStartsOn and the locale.',
  'datePicker.examples.fiscalYear': 'Fiscal year',
  'datePicker.examples.reportingQuarters': 'Reporting quarters',
  'datePicker.examples.reportingQuartersHint': 'Pick two quarters in either order; the range spans both.',
  'datePicker.examples.shipmentDate': 'Shipment date',
  'datePicker.examples.auditDate': 'Audit date',
  'datePicker.examples.visibleMonth': 'Visible month: {month}',
  'datePicker.examples.opensOnMonth': 'Opens on {month} until a date is picked.',
} as const;

export const datePickerPeriodEs = {
  'datePicker.quarter': 'T{quarter} {year}',
  'datePicker.examples.billingMonth': 'Mes de facturación',
  'datePicker.examples.billingMonthHint': 'Envía el primer día del mes.',
  'datePicker.examples.payrollWeek': 'Semana de nómina',
  'datePicker.examples.payrollWeekHint': 'Aquí las semanas empiezan en lunes; el valor sigue weekStartsOn y el idioma.',
  'datePicker.examples.fiscalYear': 'Año fiscal',
  'datePicker.examples.reportingQuarters': 'Trimestres del informe',
  'datePicker.examples.reportingQuartersHint': 'Elige dos trimestres en cualquier orden; el rango abarca ambos.',
  'datePicker.examples.shipmentDate': 'Fecha de envío',
  'datePicker.examples.auditDate': 'Fecha de auditoría',
  'datePicker.examples.visibleMonth': 'Mes visible: {month}',
  'datePicker.examples.opensOnMonth': 'Se abre en {month} hasta que se elige una fecha.',
} satisfies Record<keyof typeof datePickerPeriodEn, string>;
