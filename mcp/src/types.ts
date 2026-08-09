/* ============================================================================
   gntik-ui-mcp · types.ts — tipos compartidos del índice del design system
   ============================================================================ */

export interface RegistryItem {
  id: string;
  label: string;
  icon?: string;
  status: string;
  blurb?: string;
  group: string;
}

export interface Snippet {
  /** Nombre de la const en el catálogo (CODE_BTN, C_STACK…) o inline_N */
  name: string;
  /** Título del bloque Variant/ChartVariant que lo muestra */
  title?: string;
  /** Descripción del bloque */
  desc?: string;
  lang: string;
  /** Código canónico listo para pegar */
  code: string;
}

export interface ComponentDoc {
  id: string;
  label: string;
  group: string;
  status: string;
  blurb?: string;
  /** Archivo .jsx del catálogo del que procede */
  file?: string;
  /** Comentario de cabecera del archivo (documentación) */
  header?: string;
  /** intro= del SectionHead */
  intro?: string;
  snippets: Snippet[];
}

export interface TokenTheme {
  /** light · dark · high_contrast */
  theme: string;
  /** Selector CSS original (:root, .dark, .high_contrast) */
  selector: string;
  /** nombre de token (sin --) → valor */
  tokens: Record<string, string>;
}

export interface BlockRef {
  name: string;
  file: string;
}

export interface IndexStats {
  groups: number;
  components: number;
  withSnippets: number;
  snippets: number;
  tokens: number;
}

export interface DesignSystemIndex {
  root: string;
  source: 'dir' | 'git';
  loadedAt: string;
  gitHead?: string;
  registry: RegistryItem[];
  components: Record<string, ComponentDoc>;
  tokensCss: string;
  themes: TokenTheme[];
  tailwindConfig?: string;
  readme?: string;
  claudeMd?: string;
  inventoryMd?: string;
  /** Sección "## Reglas (duras)" del CLAUDE.md del catálogo */
  rulesMd?: string;
  blocks: BlockRef[];
  stats: IndexStats;
}
