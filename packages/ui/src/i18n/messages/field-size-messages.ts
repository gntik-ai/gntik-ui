export const fieldSizesEn = {
  'fieldSizes.comfortable': 'Comfortable',
  'fieldSizes.compact': 'Compact',
  'fieldSizes.sm': 'Small',
  'fieldSizes.auto': 'Auto',
  'fieldSizes.md': 'Medium',
  'fieldSizes.lg': 'Large',
  'fieldSizes.count': 'Count',
  'fieldSizes.time': 'Time',
  'fieldSizes.action': 'Apply',
  'fieldSizes.wrapping': 'Wrapping large selection',
  'fieldSizes.owner': 'Owner',
  'fieldSizes.editor': 'Editor',
} as const;

export const fieldSizesEs = {
  'fieldSizes.comfortable': 'Cómoda',
  'fieldSizes.compact': 'Compacta',
  'fieldSizes.sm': 'Pequeño',
  'fieldSizes.auto': 'Automático',
  'fieldSizes.md': 'Mediano',
  'fieldSizes.lg': 'Grande',
  'fieldSizes.count': 'Cantidad',
  'fieldSizes.time': 'Hora',
  'fieldSizes.action': 'Aplicar',
  'fieldSizes.wrapping': 'Selección grande en varias filas',
  'fieldSizes.owner': 'Propietario',
  'fieldSizes.editor': 'Editor',
} satisfies Record<keyof typeof fieldSizesEn, string>;
