import type { BlockMeta } from '../../meta';
import type { LogViewerLabels } from './LogViewer';

export const meta: BlockMeta = {
  name: 'Log viewer',
  family: 'builders',
  status: 'beta',
  description:
    'Windowed log stream (role="log"): level filter, search with highlighted matches, follow-tail and per-line copy. Renders only the visible rows. Optional wrap (default false) shows full messages in measured, variable-height rows; rowHeight estimates unmeasured rows. Optional labels?: Partial<LogViewerLabels> overrides each built-in label, including per-level chip and filter names through labels.levels. Explicit content props win over labels, then I18nProvider (en/es); no provider keeps English. Copied log text and imported fixtures stay unchanged. See the Catalog labels and Full messages and level names live previews.',
  labels: [
    { key: 'title', type: 'string', state: 'Visible heading and log region name; title prop wins' },
    { key: 'levelFilter', type: 'string', state: 'Level filter group name' },
    {
      key: 'levels',
      type: 'Partial<Record<LogLevel, string>>',
      state: 'Per-level chip and filter names; omitted levels use the catalog',
    },
    { key: 'searchLabel', type: 'string', state: 'Searchbox name' },
    { key: 'searchPlaceholder', type: 'string', state: 'Searchbox placeholder' },
    { key: 'follow', type: 'string', state: 'Follow switch name' },
    { key: 'count', type: '(visible: number, total: number) => string', state: 'Filtered line count' },
    { key: 'empty', type: 'string', state: 'No matching lines' },
    { key: 'inspect', type: '(timestamp: string) => string', state: 'Inspect button name when onSelectLine exists' },
    { key: 'copy', type: '(timestamp: string) => string', state: 'Copy button before copying' },
    { key: 'copied', type: 'string', state: 'Copy button after copying' },
  ] satisfies Array<{ key: keyof LogViewerLabels; type: string; state: string }>,
  uses: ['ToggleGroup', 'Toggle', 'Input', 'Switch', 'IconButton'],
};
