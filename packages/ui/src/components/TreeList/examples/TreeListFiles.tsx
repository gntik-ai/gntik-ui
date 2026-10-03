import { Cloud, FileCode, FileText, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { TreeList } from '../TreeList';
import type { TreeNode } from '../tree-model';

const folder = { icon: Folder, openIcon: FolderOpen };

const NODES: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    ...folder,
    children: [
      {
        id: 'components',
        label: 'components',
        ...folder,
        children: [
          { id: 'button', label: 'Button.tsx', icon: FileCode, meta: '2 KB' },
          { id: 'dialog', label: 'Dialog.tsx', icon: FileCode, meta: '5 KB' },
        ],
      },
      { id: 'index', label: 'index.ts', icon: FileCode, meta: '1 KB' },
    ],
  },
  { id: 'remote', label: 'remote-assets', icon: Cloud, hasChildren: true },
  { id: 'docs', label: 'docs', ...folder, children: [{ id: 'guide', label: 'getting-started.md', icon: FileText }] },
  { id: 'readme', label: 'README.md', icon: FileText, meta: '3 KB' },
];

/** Simulated fetch for a lazily loaded folder. */
function loadRemote(): Promise<TreeNode[]> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve([
          { id: 'logo', label: 'logo.svg', icon: FileText },
          { id: 'fonts', label: 'fonts.css', icon: FileCode },
        ]),
      600,
    ),
  );
}

export default function TreeListFiles() {
  const [opened, setOpened] = useState('');
  return (
    <div className="grid w-full max-w-xs gap-3">
      <TreeList
        aria-label="Repository files"
        nodes={NODES}
        defaultExpanded={['src']}
        defaultSelected={['index']}
        loadChildren={loadRemote}
        onAction={(node) => setOpened(node.label)}
        className="rounded-lg border border-border bg-card p-1.5"
      />
      <p aria-live="polite" className="h-4 font-mono text-[11px] text-muted-foreground">
        {opened && `Opened ${opened}`}
      </p>
    </div>
  );
}
