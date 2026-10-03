/* ============================================================================
   gntik-ui-mcp · analyze.ts — heurísticas: página legacy → componentes gntik-ui
   ----------------------------------------------------------------------------
   Detecta patrones de UI en el código de una página (cualquier framework) y
   sugiere los componentes del catálogo con los que remaquetarla. Añade además
   los problemas de estilo (validate) para saber qué hay que sustituir.
   ============================================================================ */
import type { DesignSystemIndex } from './types.js';
import { validatePage, type Finding } from './validate.js';

interface Pattern {
  ids: string[];
  re: RegExp;
  reason: string;
}

const PATTERNS: Pattern[] = [
  { ids: ['buttons'], re: /<button\b|<Button\b|\bbtn[-\s"'`]|type="submit"/i, reason: 'botones' },
  { ids: ['button-groups'], re: /btn-group|button-?group|segmented|ToggleGroup/i, reason: 'grupos de botones / segmentado' },
  { ids: ['tables'], re: /<table\b|<thead\b|<tbody\b|mat-table|ant-table|DataGrid|datatable/i, reason: 'tablas de datos' },
  { ids: ['form-layouts'], re: /<form\b|formGroup|onSubmit|handleSubmit/i, reason: 'formularios' },
  { ids: ['input-groups'], re: /input-group|InputAdornment|prefix=|suffix=|addon/i, reason: 'inputs con add-ons' },
  { ids: ['textareas'], re: /<textarea\b|<Textarea\b/i, reason: 'áreas de texto' },
  { ids: ['select-menus'], re: /<select\b|mat-select|listbox|<Select\b/i, reason: 'selects / listbox' },
  { ids: ['comboboxes'], re: /combobox|autocomplete|typeahead|autosuggest/i, reason: 'autocompletado' },
  { ids: ['checkboxes'], re: /type=["']checkbox|<Checkbox\b|mat-checkbox/i, reason: 'checkboxes' },
  { ids: ['radio-groups'], re: /type=["']radio|RadioGroup|mat-radio/i, reason: 'radios' },
  { ids: ['toggles'], re: /role=["']switch|<Switch\b|toggle|mat-slide-toggle/i, reason: 'switches / toggles' },
  { ids: ['file-upload'], re: /type=["']file|dropzone|<Upload\b|file-?upload/i, reason: 'subida de archivos' },
  { ids: ['date-time-picker', 'calendars'], re: /datepicker|date-?picker|timepicker|type=["']date|fullcalendar|<Calendar\b/i, reason: 'fechas / calendario' },
  { ids: ['sign-in'], re: /\blogin\b|sign-?in|type=["']password|iniciar sesi/i, reason: 'autenticación' },
  { ids: ['alerts'], re: /\balert[-\s"'`]|<Alert\b|callout|banner/i, reason: 'alertas / banners' },
  { ids: ['empty-states'], re: /empty-?state|no results|sin resultados|nothing here/i, reason: 'estados vacíos' },
  { ids: ['skeletons'], re: /skeleton|shimmer|placeholder-glow/i, reason: 'skeletons de carga' },
  { ids: ['spinners'], re: /spinner|CircularProgress|\bloader\b|isLoading|cargando/i, reason: 'indicadores de carga' },
  { ids: ['navbars'], re: /<nav\b|navbar|app-?bar|topbar/i, reason: 'barra de navegación' },
  { ids: ['breadcrumbs'], re: /breadcrumb|migas/i, reason: 'migas de pan' },
  { ids: ['tabs'], re: /role=["']tab|nav-tabs|mat-tab|<Tabs?\b|\btabs\b/i, reason: 'pestañas' },
  { ids: ['sidebar-nav', 'vertical-nav'], re: /sidebar|side-?nav|sidenav|drawer-nav/i, reason: 'navegación lateral' },
  { ids: ['pagination'], re: /pagination|page-link|\bpager\b|paginator/i, reason: 'paginación' },
  { ids: ['progress-bars'], re: /progress|<Progress\b/i, reason: 'barras de progreso' },
  { ids: ['command-palettes'], re: /command-?palette|\bcmdk\b|kbar|⌘K/i, reason: 'paleta de comandos' },
  { ids: ['modal-dialogs'], re: /modal|<Dialog\b|role=["']dialog|mat-dialog/i, reason: 'modales / diálogos' },
  { ids: ['drawers'], re: /drawer|offcanvas|side-?panel|SlideOver/i, reason: 'paneles laterales' },
  { ids: ['notifications'], re: /toast|snackbar|notification|notistack/i, reason: 'toasts / notificaciones' },
  { ids: ['tooltips'], re: /tooltip|<Tooltip\b|data-tip/i, reason: 'tooltips' },
  { ids: ['badges'], re: /badge|\bchip\b|\bpill\b|<Tag\b/i, reason: 'badges / chips' },
  { ids: ['avatars'], re: /avatar|gravatar|profile-?(pic|photo|image)/i, reason: 'avatares' },
  { ids: ['dropdowns'], re: /dropdown|<Menu\b|menuitem|context-?menu|mat-menu/i, reason: 'menús desplegables' },
  { ids: ['dividers'], re: /<hr\b|divider|<Divider\b/i, reason: 'separadores' },
  { ids: ['cards', 'action-panels'], re: /\bcard[-\s"'`]|<Card\b|\bpanel\b/i, reason: 'cards / paneles' },
  { ids: ['containers'], re: /class(?:Name)?=["'][^"']*\bcontainer\b|max-w-(?:screen|[0-9])/i, reason: 'contenedores de página' },
  { ids: ['stats'], re: /\bkpi\b|stat-|\bmetric|CountUp|big-?number/i, reason: 'stats / KPIs' },
  { ids: ['billing-usage'], re: /billing|invoice|factura|quota|cuota|usage|consumo/i, reason: 'billing / consumo' },
  { ids: ['description-lists'], re: /<dl\b|<dt\b|<dd\b|description-?list/i, reason: 'listas de descripción' },
  { ids: ['stacked-lists', 'list-containers'], re: /<ul\b|<li\b|list-group|ListItem/i, reason: 'listas' },
  { ids: ['grid-lists'], re: /grid-cols|grid-template|card-grid|<Grid\b/i, reason: 'rejillas de tarjetas' },
  { ids: ['feeds'], re: /timeline|activity|\bfeed\b|historial/i, reason: 'feeds / actividad' },
  { ids: ['chartkit', 'area-charts', 'bar-charts', 'line-charts', 'donut-charts', 'combo-charts'], re: /recharts|chart\.?js|highcharts|apexchart|d3\.|<canvas\b|echarts|\bchart\b|gráfic/i, reason: 'gráficas' },
  { ids: ['page-headings'], re: /<h1\b/i, reason: 'cabecera de página' },
  { ids: ['section-headings', 'card-headings'], re: /<h2\b|<h3\b/i, reason: 'cabeceras de sección' },
  { ids: ['filters'], re: /\bfilter|facet|saved-?view|filtro/i, reason: 'filtros' },
  { ids: ['reactflow'], re: /react-?flow|\bnodes\b.*\bedges\b|diagram/i, reason: 'diagrama de nodos' },
  { ids: ['monaco'], re: /monaco|codemirror|ace-editor|code-?editor/i, reason: 'editor de código' },
];

const FRAMEWORK_HINTS: Array<{ name: string; re: RegExp; hint: string }> = [
  { name: 'Bootstrap', re: /\bbtn btn-|col-(?:xs|sm|md|lg|xl)-\d|glyphicon|navbar-expand|card-body/, hint: 'Sustituye las clases de Bootstrap por el markup del catálogo (mismas piezas, clases de token).' },
  { name: 'Material UI', re: /\bMui[A-Z]|@mui\/|@material-ui\//, hint: 'Reemplaza los componentes MUI por el markup canónico del catálogo; el theming de MUI desaparece (lo hacen los tokens).' },
  { name: 'Ant Design', re: /\bant-[a-z]|from ['"]antd['"]/, hint: 'Reemplaza antd por el markup del catálogo; los ConfigProvider/temas sobran.' },
  { name: 'Chakra UI', re: /chakra-|from ['"]@chakra-ui/, hint: 'Sustituye props de estilo Chakra por clases de token.' },
  { name: 'Angular Material', re: /mat-[a-z-]+|@angular\/material/, hint: 'Mantén la lógica Angular; traslada el template al markup del catálogo (las clases Tailwind/token funcionan igual en templates Angular).' },
  { name: 'styled-components / Emotion', re: /styled\.[a-z]+`|styled\([A-Za-z]|css`/, hint: 'Migra los estilos CSS-in-JS a clases de utilidad con tokens; elimina los styled wrappers.' },
  { name: 'CSS Modules / SCSS', re: /styles\.[a-zA-Z]|\.module\.(?:s?css)|@import ['"].*\.scss/, hint: 'Sustituye las clases del module por utilidades de token; borra el CSS muerto al terminar.' },
];

export interface Suggestion {
  id: string;
  label?: string;
  group?: string;
  blurb?: string;
  reasons: string[];
  lines: number[];
  hits: number;
}

export interface Analysis {
  suggestions: Suggestion[];
  frameworks: Array<{ name: string; hint: string }>;
  styleErrors: Finding[];
  stats: { lines: number; tokensUsed: number; totalStyleErrors: number };
}

export function analyzePage(source: string, index?: DesignSystemIndex): Analysis {
  const lines = source.split('\n');
  const byId = new Map<string, Suggestion>();

  lines.forEach((line, i) => {
    for (const p of PATTERNS) {
      if (!p.re.test(line)) continue;
      for (const id of p.ids) {
        let s = byId.get(id);
        if (!s) {
          const reg = index?.registry.find((r) => r.id === id);
          s = { id, label: reg?.label, group: reg?.group, blurb: reg?.blurb, reasons: [], lines: [], hits: 0 };
          byId.set(id, s);
        }
        s.hits++;
        if (!s.reasons.includes(p.reason)) s.reasons.push(p.reason);
        if (s.lines.length < 5 && !s.lines.includes(i + 1)) s.lines.push(i + 1);
      }
    }
  });

  // shell completo: si hay nav lateral + barra superior, sugiere app-shell
  if ((byId.has('sidebar-nav') || byId.has('vertical-nav')) && byId.has('navbars') && !byId.has('app-shell')) {
    const reg = index?.registry.find((r) => r.id === 'app-shell');
    byId.set('app-shell', {
      id: 'app-shell', label: reg?.label ?? 'App shell', group: reg?.group, blurb: reg?.blurb,
      reasons: ['sidebar + topbar detectados → usa el chrome compartido completo'],
      lines: [], hits: 99,
    });
  }

  const frameworks = FRAMEWORK_HINTS
    .filter((f) => f.re.test(source))
    .map((f) => ({ name: f.name, hint: f.hint }));

  const report = validatePage(source);
  const styleErrors = report.findings.filter((f) => f.severity === 'error').slice(0, 25);

  return {
    suggestions: [...byId.values()].sort((a, b) => b.hits - a.hits),
    frameworks,
    styleErrors,
    stats: {
      lines: lines.length,
      tokensUsed: report.tokensUsed,
      totalStyleErrors: report.errors,
    },
  };
}
