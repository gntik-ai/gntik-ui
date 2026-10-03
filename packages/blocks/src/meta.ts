/** Metadata contract for a block: packages/blocks/src/<family>/<Name>/block.meta.ts. */
export interface BlockMeta {
  /** Display name, e.g. "KPI row". */
  name: string;
  family:
    | 'page-chrome'
    | 'shell'
    | 'data-display'
    | 'tables'
    | 'forms'
    | 'feedback'
    | 'billing'
    | 'team'
    | 'scheduling'
    | 'builders'
    | 'ai'
    | 'auth'
    | 'marketing';
  status: 'stable' | 'beta' | 'experimental';
  description: string;
  /** @gntik-ai/ui (and other kit) components it composes, for docs and agents. */
  uses: string[];
}
