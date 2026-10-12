import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Truncated collection footer',
  family: 'tables',
  status: 'beta',
  description:
    'Presentation-only summary of a loaded first cursor page without a total or pager. N+ is a lower bound when hasMore is true; the note explains that more items exist. Compose below data-table (DataTable with paginated={false}). First-page recipe: use hasMore={true} for N+ plus a note, and supply noteId so a consumer table can reference it with aria-describedby. DataTable does not forward aria-describedby; its named containing region can reference the note instead. Count-only recipe: use hasMore={false} for the visible count without a note. PageToolbar has no count prop; this block carries the count. No navigation or focusable elements. Every visible string is overridable through noun, summaryLabel, formatCount and truncationNote; ReactNode overrides must remain plain text without interactive or hidden content. The i18n provider supplies translated defaults; locale overrides number formatting. Required inputs are visibleCount and hasMore, with meaningful runtime defaults for the JavaScript catalogue preview.',
  uses: [],
};
