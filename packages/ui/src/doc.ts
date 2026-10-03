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
  /** WAI-ARIA pattern the a11y contract test checks. */
  pattern?: string;
  /** Keyboard contract: key → behaviour. Each row is covered by a test. */
  keyboard?: Array<[key: string, behaviour: string]>;
  /** Tokens the component reads (for the theming docs). */
  tokens?: string[];
}
