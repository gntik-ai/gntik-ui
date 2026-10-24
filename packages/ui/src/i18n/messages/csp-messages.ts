/** CSP guide and live-preview copy. Kept separate so the main catalogs stay below 1000 lines. */
export const cspEn = {
  'csp.title': 'Strict CSP',
  'csp.description':
    'Pass the app server nonce to Base UI and kit inline elements, or disable style elements and use static CSS.',
  'csp.choice': 'Preview choice',
  'csp.content': 'Scrollable preview content',
  'csp.document': 'Print preview',
  'csp.disable': 'Disable style elements',
  'csp.enable': 'Enable style elements',
  'csp.disabled': 'Style elements disabled',
  'csp.enabled': 'Style elements enabled',
  'csp.guideIntro':
    'The app server owns the policy and nonce. CSPProvider forwards them to kit inline elements; useCSP exposes the same settings for your own elements.',
  'csp.nonceWarning':
    'Generate a cryptographically random nonce for every response. Never hardcode, reuse or cache a nonce-bearing HTML response. The provider does not generate or validate nonces.',
  'csp.nextTitle': 'Next.js App Router',
  'csp.nextGuide':
    'Use proxy.ts on Next.js 16. Set the policy on both the request and response so Next applies the nonce to its own scripts. Read headers() in a dynamically rendered server layout and pass the nonce to a client CSPProvider and the theme script. See apps/example-next/proxy.ts and app/layout.tsx for the complete production setup.',
  'csp.themeGuide':
    'Import themeScript from the server-safe @gntik-ai/ui/theme-script entry. The main @gntik-ai/ui bundle is use client: do not call its functions from a Server Component. For a cookie-based theme, follow the local server-safe script in example-next.',
  'csp.rendererGuide':
    'React 19.3 requires a style nonce in the server renderer options for hoisted style resources: nonce: { script: nonce, style: nonce }. Next currently passes only a script nonce. The example therefore also enables disableStyleElements and puts the print rule in globals.css. For a custom streaming renderer, pass both nonces; renderToString has no renderer nonce option.',
  'csp.viteTitle': 'Vite and static hosting',
  'csp.viteGuide':
    'Vite html.cspNonce adds nonces to generated HTML elements. For per-request HTML, use a placeholder and replace it in every response together with the matching CSP header. Pass that response nonce to CSPProvider and any inline theme script; the build setting alone does not create a fresh runtime nonce.',
  'csp.staticGuide':
    'For static hosting, disableStyleElements suppresses scrollbar and print style elements. Static scrollbar classes keep native scrollbars hidden. Serve theme-bootstrap.js from your own origin and load it before the app with script-src self. Avoid renderBeforeHydration on TabsIndicator and thumbAlignment=edge on Slider in a nonce-free policy: prehydration scripts still need a nonce or an app-managed hash.',
  'csp.printTitle': 'Print rules and style attributes',
  'csp.printGuide':
    'With disableStyleElements or pageRule=false, move the PrintLayout @page rule into the app stylesheet. Match its size and margin props; the defaults are A4 and 20mm.',
  'csp.attributeGuide':
    'Server-rendered style attributes still require style-src-attr unsafe-inline. disableStyleElements affects style tags only. Editor (Monaco) and charts (Recharts) inline styles are outside this guide.',
  'csp.useTitle': 'Custom inline elements',
} as const;

export const cspEs = {
  'csp.title': 'Strict CSP',
  'csp.description':
    'Pasa el nonce del servidor a los elementos en línea del kit y Base UI, o desactiva los elementos de estilo y usa CSS estático.',
  'csp.choice': 'Opción de vista previa',
  'csp.content': 'Contenido desplazable de vista previa',
  'csp.document': 'Vista previa de impresión',
  'csp.disable': 'Desactivar elementos de estilo',
  'csp.enable': 'Activar elementos de estilo',
  'csp.disabled': 'Elementos de estilo desactivados',
  'csp.enabled': 'Elementos de estilo activados',
  'csp.guideIntro':
    'El servidor de la aplicación administra la política y el nonce. CSPProvider los transmite a los elementos en línea del kit; useCSP expone la misma configuración para tus propios elementos.',
  'csp.nonceWarning':
    'Genera un nonce criptográficamente aleatorio para cada respuesta. Nunca fijes, reutilices ni almacenes en caché respuestas HTML con nonce. El proveedor no genera ni valida nonces.',
  'csp.nextTitle': 'Next.js App Router',
  'csp.nextGuide':
    'Usa proxy.ts en Next.js 16. Establece la política en la petición y la respuesta para que Next aplique el nonce a sus scripts. Lee headers() en un layout de servidor dinámico y pasa el nonce a un CSPProvider de cliente y al script del tema. Consulta apps/example-next/proxy.ts y app/layout.tsx para la configuración completa de producción.',
  'csp.themeGuide':
    'Importa themeScript desde la entrada segura para servidor @gntik-ai/ui/theme-script. El paquete principal @gntik-ai/ui es use client: no llames sus funciones desde un Server Component. Para un tema basado en cookies, sigue el script local seguro para servidor de example-next.',
  'csp.rendererGuide':
    'React 19.3 requiere un nonce de estilo en las opciones del renderizador de servidor para recursos de estilo elevados: nonce: { script: nonce, style: nonce }. Next actualmente solo pasa un nonce de script. Por ello, el ejemplo también activa disableStyleElements y pone la regla de impresión en globals.css. En un renderizador de streaming propio, pasa ambos nonces; renderToString no ofrece esa opción.',
  'csp.viteTitle': 'Vite y alojamiento estático',
  'csp.viteGuide':
    'Vite html.cspNonce añade nonces a los elementos HTML generados. Para HTML por petición, usa un marcador y reemplázalo en cada respuesta junto con la cabecera CSP correspondiente. Pasa ese nonce a CSPProvider y a cualquier script de tema en línea; la configuración de compilación no genera un nonce nuevo en tiempo de ejecución.',
  'csp.staticGuide':
    'En alojamiento estático, disableStyleElements suprime los elementos de estilo de desplazamiento e impresión. Las clases estáticas ocultan las barras nativas. Sirve theme-bootstrap.js desde tu origen y cárgalo antes de la aplicación con script-src self. Evita renderBeforeHydration en TabsIndicator y thumbAlignment=edge en Slider sin nonce: sus scripts aún necesitan un nonce o un hash administrado por la aplicación.',
  'csp.printTitle': 'Reglas de impresión y atributos de estilo',
  'csp.printGuide':
    'Con disableStyleElements o pageRule=false, mueve la regla @page de PrintLayout a la hoja de estilos de la aplicación. Haz coincidir size y margin; los valores predeterminados son A4 y 20mm.',
  'csp.attributeGuide':
    'Los atributos de estilo renderizados en el servidor aún requieren style-src-attr unsafe-inline. disableStyleElements solo afecta a las etiquetas style. Los estilos en línea de editor (Monaco) y charts (Recharts) quedan fuera de esta guía.',
  'csp.useTitle': 'Elementos en línea personalizados',
} satisfies Record<keyof typeof cspEn, string>;
