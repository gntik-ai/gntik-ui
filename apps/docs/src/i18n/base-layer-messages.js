/** Docs-only guide catalogs for the optional page baseline. */
export const baseLayerMessages = {
  en: {
    title: 'Optional page baseline',
    overview:
      'Import @gntik-ai/tokens/base.css after the kit styles to opt in to themed body colours, fonts, selection, scrollbars and overlay setup. It is opt-in: the other kit stylesheets do not import it. Every rule sits in @layer base, so utilities such as bg-card and unlayered app CSS override these defaults.',
    gutter:
      'Scrollbars use the border token with a transparent track. The gutter stays auto by default; add data-scroll-gutter="stable" to html to reserve scrollbar space on content pages. Leave it off full-height shells to avoid an empty gutter.',
    root: 'The base layer isolates #root, #__next and [data-app-root] so app content stays below popups portalled to body. Next.js App Router apps need a data-app-root wrapper around their app tree inside body. Keep portal containers attached to body; positioned or transformed portal ancestors can break the Safari backdrop setup.',
  },
  es: {
    title: 'Estilos base opcionales',
    overview:
      'Importa @gntik-ai/tokens/base.css después de los estilos del kit para aplicar colores del tema, fuentes, selección, barras de desplazamiento y configuración de superposiciones. Es opcional: las otras hojas del kit no lo importan. Todas las reglas están en @layer base, por lo que utilidades como bg-card y el CSS de la aplicación sin capa reemplazan estos valores predeterminados.',
    gutter:
      'Las barras de desplazamiento usan el token de borde con una pista transparente. El espacio reservado es auto por defecto; añade data-scroll-gutter="stable" a html para reservarlo en páginas de contenido. Omítelo en estructuras de altura completa para evitar un espacio vacío.',
    root: 'La capa base aísla #root, #__next y [data-app-root] para mantener el contenido de la aplicación debajo de las ventanas emergentes montadas en body mediante portales. Las aplicaciones con Next.js App Router necesitan un contenedor data-app-root alrededor de su árbol dentro de body. Mantén los contenedores de portales en body; los ancestros posicionados o transformados pueden alterar la configuración del fondo en Safari.',
  },
};
