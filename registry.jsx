/* ============================================================================
   Gntik UI · registry.jsx — INVENTARIO de componentes (fuente única)
   Alimenta: el sidebar del catálogo, el dashboard de progreso y el router.
   Las secciones reales se registran en window.SECTIONS desde cada archivo.
   status: 'done' · 'wip' · 'todo'
   ============================================================================ */

const REGISTRY = [
  { group: 'Empezar', icon: 'home', items: [
    { id: 'overview', label: 'Overview', icon: 'home', status: 'done', blurb: 'Inventario, progreso y cómo adoptar la template.' },
  ]},
  { group: 'Fundamentos', icon: 'palette', items: [
    { id: 'foundations', label: 'Foundations', icon: 'palette', status: 'done', blurb: 'Tokens: color, tipografía, espaciado, radios, sombras e iconos.' },
  ]},
  { group: 'App shell', icon: 'layout', items: [
    { id: 'app-shell', label: 'App shell', icon: 'layout', status: 'done', blurb: 'Sidebar + topbar + cabecera de página. El chrome compartido.' },
  ]},
  { group: 'Headings', icon: 'heading', items: [
    { id: 'page-headings', label: 'Page headings', icon: 'heading', status: 'done', blurb: 'Título + meta + acciones de página, con tabs y banner.' },
    { id: 'section-headings', label: 'Section headings', icon: 'heading', status: 'done', blurb: 'Cabeceras de bloque dentro del contenido.' },
    { id: 'card-headings', label: 'Card headings', icon: 'heading', status: 'done', blurb: 'Cabeceras de tarjeta con acciones y descripción.' },
  ]},
  { group: 'Datos', icon: 'database', items: [
    { id: 'description-lists', label: 'Description lists', icon: 'list', status: 'done', blurb: 'Pares clave-valor para detalle de recurso.' },
    { id: 'stats', label: 'Stats', icon: 'chart', status: 'done', blurb: 'Stat cards con delta + mini gráficas (barras/líneas/donut).' },
    { id: 'billing-usage', label: 'Billing & usage', icon: 'creditcard', status: 'done', blurb: 'Plan, medidores de cuota, factura, gasto vs presupuesto y desglose de coste.' },
    { id: 'calendars', label: 'Calendars', icon: 'calendar', status: 'done', blurb: 'Schedulers del Fleet: vistas mensual, semanal, diaria y borderless.' },
  ]},
  { group: 'Gráficas', icon: 'line', items: [
    { id: 'area-charts', label: 'Area charts', icon: 'activity', status: 'done', blurb: 'Tendencia con relleno — simple y apilada.' },
    { id: 'bar-charts', label: 'Bar charts', icon: 'chart', status: 'done', blurb: 'Conteos por categoría — apilada, agrupada y horizontal.' },
    { id: 'line-charts', label: 'Line charts', icon: 'line', status: 'done', blurb: 'Series finas para comparar tendencias.' },
    { id: 'combo-charts', label: 'Combo charts', icon: 'bricks', status: 'done', blurb: 'Barras + línea con doble eje.' },
    { id: 'donut-charts', label: 'Donut charts', icon: 'coin', status: 'done', blurb: 'Reparto de un total — donut y pie.' },
  ]},
  { group: 'Listas', icon: 'list', items: [
    { id: 'stacked-lists', label: 'Stacked lists', icon: 'list', status: 'done', blurb: 'Filas apiladas con avatar, meta y acción.' },
    { id: 'tables', label: 'Tables', icon: 'table', status: 'done', blurb: 'Tabla densa con estado, orden y selección.' },
    { id: 'grid-lists', label: 'Grid lists', icon: 'grid', status: 'done', blurb: 'Rejilla de tarjetas para recursos.' },
    { id: 'list-containers', label: 'List containers', icon: 'box', status: 'done', blurb: 'Contenedores de lista (simple, dividido, en card).' },
    { id: 'feeds', label: 'Feeds', icon: 'activity', status: 'done', blurb: 'Actividad y setup: lifecycle, comentarios, feed mixto, timeline de estado, checklists y panel con tabs.' },
  ]},
  { group: 'Formularios', icon: 'form', items: [
    { id: 'form-layouts', label: 'Form layouts', icon: 'form', status: 'done', blurb: 'Inputs, textarea, switch, checkbox y secciones de formulario.' },
    { id: 'input-groups', label: 'Input groups', icon: 'form', status: 'done', blurb: 'Add-ons, iconos, prefijos, botón adjunto, estados y tamaños.' },
    { id: 'file-upload', label: 'File upload', icon: 'upload', status: 'done', blurb: 'Dropzone multi-archivo con progreso, input compacto y subida de logo.' },
    { id: 'textareas', label: 'Textareas', icon: 'form', status: 'done', blurb: 'Textarea simple, compositor con toolbar y contador de caracteres.' },
    { id: 'select-menus', label: 'Select menus', icon: 'chevron', status: 'done', blurb: 'Select nativo y listbox custom con check, avatar y estado.' },
    { id: 'comboboxes', label: 'Comboboxes', icon: 'search', status: 'done', blurb: 'Autocompletar con filtrado en vivo, avatares y estado.' },
    { id: 'checkboxes', label: 'Checkboxes', icon: 'check', status: 'done', blurb: 'Lista con descripción, inline y como tarjetas seleccionables.' },
    { id: 'radio-groups', label: 'Radio groups', icon: 'toggle', status: 'done', blurb: 'Lista, tarjetas apiladas y selección segmentada en color.' },
    { id: 'toggles', label: 'Toggles', icon: 'toggle', status: 'done', blurb: 'Switches: simple, con etiqueta, con icono y fila de ajuste.' },
    { id: 'action-panels', label: 'Action panels', icon: 'box', status: 'done', blurb: 'Paneles de acción: con botón, input, toggle y well.' },
    { id: 'date-time-picker', label: 'Date & time picker', icon: 'calendar', status: 'done', blurb: 'Selector de fecha y hora editables: popover con calendario + slots e inputs typeables.' },
    { id: 'sign-in', label: 'Sign-in & registro', icon: 'lock', status: 'done', blurb: 'Split de auth: panel de marca + formulario + SSO.' },
  ]},
  { group: 'Feedback', icon: 'bell2', items: [
    { id: 'alerts', label: 'Alerts', icon: 'alert', status: 'done', blurb: 'Info, warning y destructive, con acciones.' },
    { id: 'empty-states', label: 'Empty states', icon: 'inbox', status: 'done', blurb: 'Estados vacíos con CTA.' },
    { id: 'skeletons', label: 'Skeletons', icon: 'bricks', status: 'done', blurb: 'Loading states: bloques, lista, tabla y swap cargando → cargado.' },
  ]},
  { group: 'Navegación', icon: 'compass', items: [
    { id: 'navbars', label: 'Navbars', icon: 'menu', status: 'done', blurb: 'Barra superior con nav, buscador y perfil.' },
    { id: 'breadcrumbs', label: 'Breadcrumbs', icon: 'chevronRight', status: 'done', blurb: 'Migas con separador y truncado.' },
    { id: 'tabs', label: 'Tabs', icon: 'layout', status: 'done', blurb: 'Pills, subrayado y con badges.' },
    { id: 'vertical-nav', label: 'Vertical navigation', icon: 'list', status: 'done', blurb: 'Nav lateral con grupos e iconos.' },
    { id: 'sidebar-nav', label: 'Sidebar navigation', icon: 'layout', status: 'done', blurb: 'Sidebar de producto colapsable.' },
    { id: 'pagination', label: 'Pagination', icon: 'arrow', status: 'done', blurb: 'Paginación numérica y prev/next.' },
    { id: 'progress-bars', label: 'Progress bars', icon: 'activity', status: 'done', blurb: 'Barras, pasos y circular.' },
    { id: 'command-palettes', label: 'Command palettes', icon: 'search', status: 'done', blurb: '⌘K con búsqueda, grupos y atajos.' },
  ]},
  { group: 'Overlays', icon: 'layers', items: [
    { id: 'modal-dialogs', label: 'Modal dialogs', icon: 'layout', status: 'done', blurb: 'Modales con scrim, confirmación y formulario.' },
    { id: 'drawers', label: 'Drawers', icon: 'layout', status: 'done', blurb: 'Paneles laterales para detalle y edición.' },
    { id: 'notifications', label: 'Notifications', icon: 'bell', status: 'done', blurb: 'Toasts apilados con acción y autodismiss.' },
    { id: 'tooltips', label: 'Tooltips', icon: 'info', status: 'done', blurb: 'Hint efímero: sólido, en toolbar de iconos y enriquecido en card.' },
  ]},
  { group: 'Elementos', icon: 'box', items: [
    { id: 'buttons', label: 'Buttons', icon: 'box', status: 'done', blurb: 'Variantes, tamaños, iconos y estados.' },
    { id: 'button-groups', label: 'Button groups', icon: 'grid', status: 'done', blurb: 'Segmentados y split buttons.' },
    { id: 'badges', label: 'Badges & pills', icon: 'spark', status: 'done', blurb: 'Status pills, badges y tags.' },
    { id: 'avatars', label: 'Avatars', icon: 'user', status: 'done', blurb: 'Avatar, iniciales, grupo y estado.' },
    { id: 'dropdowns', label: 'Dropdowns', icon: 'dot3', status: 'done', blurb: 'Menús con grupos, checks y peligro.' },
    { id: 'dividers', label: 'Dividers', icon: 'minus', status: 'done', blurb: 'Separadores con label y acción.' },
  ]},
  { group: 'Layout', icon: 'box', items: [
    { id: 'containers', label: 'Containers', icon: 'box', status: 'done', blurb: 'Anchos de contenido y paddings de página.' },
    { id: 'cards', label: 'Cards', icon: 'box', status: 'done', blurb: 'Tarjetas: simple, con cabecera, con footer.' },
  ]},
  { group: 'Filtros', icon: 'filter', items: [
    { id: 'filters', label: 'Filters', icon: 'filter', status: 'done', blurb: 'Toolbar: buscador + popovers + chips + vistas guardadas.' },
  ]},
  { group: 'Flow', icon: 'flowGraph', items: [
    { id: 'reactflow', label: 'ReactFlow', icon: 'flowGraph', status: 'done', blurb: 'Lienzo de nodos: arrastrar, zoom/pan, handles y edges.' },
  ]},
];

function regFlat() { return REGISTRY.flatMap(g => g.items.map(it => ({ ...it, group: g.group }))); }
function regFind(id) { return regFlat().find(it => it.id === id); }
function regCounts() {
  const all = regFlat();
  return {
    total: all.length,
    done: all.filter(i => i.status === 'done').length,
    wip: all.filter(i => i.status === 'wip').length,
    todo: all.filter(i => i.status === 'todo').length,
  };
}

window.SECTIONS = window.SECTIONS || {};
Object.assign(window, { REGISTRY, regFlat, regFind, regCounts });
