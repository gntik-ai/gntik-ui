/** English labels for the KitProvider catalog examples. */
export const kitEn = {
  'kit.saved': 'Saved',
  'kit.moved': 'Moved',
  'kit.announce': 'Announce move',
  'kit.confirmMessage': 'Delete project?',
  'kit.confirmed': 'Confirmed',
  'kit.cancelled': 'Cancelled',
  'kit.scopeTitle': 'Embedded panel',
  'kit.scopeHint': 'Theme, locale and density stay inside this panel.',
  'kit.settings': 'Provider settings',
  'kit.prop': 'Prop',
  'kit.provider': 'Provider',
  'kit.route': 'Preview route',
} as const;

/** Spanish labels matching the KitProvider English catalog. */
export const kitEs = {
  'kit.saved': 'Guardado',
  'kit.moved': 'Movido',
  'kit.announce': 'Anunciar movimiento',
  'kit.confirmMessage': '¿Eliminar el proyecto?',
  'kit.confirmed': 'Confirmado',
  'kit.cancelled': 'Cancelado',
  'kit.scopeTitle': 'Panel integrado',
  'kit.scopeHint': 'El tema, el idioma y la densidad se mantienen dentro de este panel.',
  'kit.settings': 'Configuración de proveedores',
  'kit.prop': 'Propiedad',
  'kit.provider': 'Proveedor',
  'kit.route': 'Ruta de vista previa',
} satisfies Record<keyof typeof kitEn, string>;
