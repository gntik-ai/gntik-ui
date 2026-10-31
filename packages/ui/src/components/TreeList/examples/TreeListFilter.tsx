import { Search } from 'lucide-react';
import { useState } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { matchText } from '../../../utils/match-text';
import { Checkbox } from '../../Checkbox';
import { Input } from '../../Input';
import { TreeList } from '../TreeList';
import { isBranch, type TreeNode } from '../tree-model';
import { treeListFileNodes } from './TreeListFiles';

const filesOnly = (node: TreeNode, query: string) => !isBranch(node) && matchText(node.label, query);

export default function TreeListFilter() {
  const { t } = useI18n();
  const [query, setQuery] = useState('dialog');
  const [onlyFiles, setOnlyFiles] = useState(false);
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input
        aria-label={t('treeList.examples.filterHint')}
        placeholder={t('treeList.examples.filterHint')}
        leadingIcon={Search}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Checkbox label={t('treeList.examples.filesOnly')} checked={onlyFiles} onCheckedChange={setOnlyFiles} />
      <TreeList
        aria-label={t('treeList.examples.files')}
        nodes={treeListFileNodes}
        filter={query}
        filterNode={onlyFiles ? filesOnly : undefined}
        defaultExpanded={['src']}
        defaultSelected={['index']}
        className="rounded-lg border border-border bg-card p-1.5"
      />
      <p className="text-xs text-muted-foreground">{t('treeList.examples.hint')}</p>
    </div>
  );
}
