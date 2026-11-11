export const toggleGroupEn = {
  'toggleGroup.status': 'Status',
  'toggleGroup.statusMultiple': 'Status filters',
  'toggleGroup.all': 'All',
  'toggleGroup.running': 'Running',
  'toggleGroup.failed': 'Failed',
} as const;

export const toggleGroupEs = {
  'toggleGroup.status': 'Estado',
  'toggleGroup.statusMultiple': 'Filtros de estado',
  'toggleGroup.all': 'Todos',
  'toggleGroup.running': 'En curso',
  'toggleGroup.failed': 'Fallidos',
} satisfies Record<keyof typeof toggleGroupEn, string>;
