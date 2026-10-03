/** Metadata contract for a page template: packages/templates/src/<id>/template.meta.ts. */
export interface TemplateMeta {
  /** Display name, e.g. "Home dashboard". */
  name: string;
  family: 'Shells' | 'Auth' | 'Onboarding' | 'Overview' | 'Resources' | 'Work' | 'Settings' | 'System' | 'AI' | 'Builders' | 'Help';
  priority: 'P1' | 'P2' | 'P3';
  status: 'stable' | 'beta' | 'experimental';
  description: string;
  /** Layout it is built on, e.g. "SidebarLayout". */
  layout: string;
  /** Blocks it composes (ids from kit-registry.json). */
  blocks: string[];
}
