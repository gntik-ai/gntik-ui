/**
 * Component documentation contract. Every component folder exports a `*.doc.ts`
 * with this shape; the registry build and the docs site read it.
 */
export interface ComponentDoc {
  /** Public component name, e.g. "Button". */
  name: string;
  /** Inventory group, e.g. "Actions", "Forms", "Overlays". */
  group: 'Actions' | 'Forms' | 'Overlays' | 'Navigation' | 'Display' | 'Feedback' | 'Layout' | 'Theme';
  /** Lifecycle badge. */
  status: 'stable' | 'beta' | 'experimental';
  description: string;
  /** Headless primitive it is built on, if any (e.g. "@base-ui/react/dialog"). */
  primitive?: string;
  /** JSX skeleton showing the public compound parts. */
  anatomy?: string;
  /** State attribute, styled part and product-agnostic meaning. */
  dataAttributes?: Array<[attribute: string, part: string, meaning: string]>;
  /** WAI-ARIA pattern the a11y contract test checks. */
  pattern?: string;
  /** Keyboard contract: key → behaviour. Each row is covered by a test. */
  keyboard?: Array<[key: string, behaviour: string]>;
  /** Tokens the component reads (for the theming docs). */
  tokens?: string[];
}

/**
 * Hook documentation contract. Every hook in `src/hooks/index.ts` has a `hooks/<useName>.doc.ts`
 * exporting `doc: HookDoc`; the registry build, the docs Hooks page and the coverage test read it.
 */
export interface HookDoc {
  /** Public hook name, e.g. "useClipboard". */
  name: string;
  /** Lifecycle badge. */
  status: ComponentDoc['status'];
  description: string;
  /** Call signature, e.g. "useClipboard(options?): { copy, status, copied, error, reset }". */
  signature: string;
  /**
   * What the hook returns without a DOM (server render and first hydration render). Put literal
   * values in backticks: the SSR test checks that the example's server output contains each one.
   */
  server: string;
  /** Non-hook helpers exported next to the hook that this doc covers, e.g. "readLocalStorageValue". Every `use*` hook has its own doc. */
  also?: string[];
}
