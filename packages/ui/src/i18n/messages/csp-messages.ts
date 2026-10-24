/** Shared CSP labels and live-preview copy. Guide prose lives in the docs app catalog. */
export const cspEn = {
  'csp.title': 'Strict CSP',
  'csp.description':
    'CSPProvider passes the app server nonce to Base UI and kit inline elements; useCSP exposes the settings for custom elements. Disable style elements to use static CSS.',
  'csp.choice': 'Preview choice',
  'csp.content': 'Scrollable preview content',
  'csp.document': 'Print preview',
  'csp.disable': 'Disable style elements',
  'csp.enable': 'Enable style elements',
  'csp.disabled': 'Style elements disabled',
  'csp.enabled': 'Style elements enabled',
} as const;

export const cspEs = {
  'csp.title': 'CSP estricta',
  'csp.description':
    'CSPProvider pasa el nonce del servidor a los elementos en línea del kit y Base UI; useCSP expone la configuración para elementos propios. Desactiva los elementos de estilo para usar CSS estático.',
  'csp.choice': 'Opción de vista previa',
  'csp.content': 'Contenido desplazable de vista previa',
  'csp.document': 'Vista previa de impresión',
  'csp.disable': 'Desactivar elementos de estilo',
  'csp.enable': 'Activar elementos de estilo',
  'csp.disabled': 'Elementos de estilo desactivados',
  'csp.enabled': 'Elementos de estilo activados',
} satisfies Record<keyof typeof cspEn, string>;
