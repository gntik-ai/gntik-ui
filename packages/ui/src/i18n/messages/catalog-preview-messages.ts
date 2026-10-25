/** Catalog copy for scoped theme and resource previews. */
export const catalogPreviewEn = {
  'themeScope.title': 'Light preview',
  'themeScope.description': 'This card and its popup use the light theme.',
  'themeScope.choice': 'Preview choice',
  'themeScope.personal': 'Personal',
  'themeScope.nested': 'A dark region inside a light region.',
  'themeScope.release': 'Release forced theme',
  'themeScope.force': 'Force light theme',
  'resourceDetail.overview': 'Overview',
  'resourceDetail.activity': 'Activity',
  'resourceDetail.settings': 'Settings',
  'resourceDetail.sections': 'Resource sections',
} as const;

export const catalogPreviewEs = {
  'themeScope.title': 'Vista previa clara',
  'themeScope.description': 'Esta tarjeta y su menú usan el tema claro.',
  'themeScope.choice': 'Opción de vista previa',
  'themeScope.personal': 'Personal',
  'themeScope.nested': 'Una región oscura dentro de una región clara.',
  'themeScope.release': 'Liberar tema forzado',
  'themeScope.force': 'Forzar tema claro',
  'resourceDetail.overview': 'Resumen',
  'resourceDetail.activity': 'Actividad',
  'resourceDetail.settings': 'Configuración',
  'resourceDetail.sections': 'Secciones del recurso',
} satisfies Record<keyof typeof catalogPreviewEn, string>;
