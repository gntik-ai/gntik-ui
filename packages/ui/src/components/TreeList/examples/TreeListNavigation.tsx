import { createContext, useContext, useMemo, useState, type ComponentPropsWithRef } from 'react';
import { useI18n } from '../../../i18n/I18nProvider';
import { Input } from '../../Input';
import { LinkProvider } from '../../Link';
import { TreeList } from '../TreeList';
import type { TreeNode } from '../tree-model';

const NavigateContext = createContext<(href: string) => void>(() => {});

// This local adapter demonstrates a router without leaving the live preview.
function PreviewLink({ onClick, ...props }: ComponentPropsWithRef<'a'>) {
  const navigate = useContext(NavigateContext);
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && event.button === 0) {
          event.preventDefault();
          if (props.href) navigate(props.href);
        }
      }}
    />
  );
}

export default function TreeListNavigation() {
  const { t } = useI18n();
  const [filter, setFilter] = useState('');
  const [currentHref, setCurrentHref] = useState('/docs/getting-started');
  const nodes = useMemo<TreeNode[]>(
    () => [
      {
        id: 'documentation',
        label: t('treeList.examples.documentation'),
        href: '/docs',
        children: [
          { id: 'getting-started', label: t('treeList.examples.gettingStarted'), href: '/docs/getting-started' },
          { id: 'components', label: t('treeList.examples.components'), href: '/docs/components' },
          { id: 'configuration', label: t('treeList.examples.configuration'), href: '/docs/configuration' },
          { id: 'unavailable', label: t('treeList.examples.unavailable'), href: '/docs/unavailable', disabled: true },
        ],
      },
    ],
    [t],
  );
  return (
    <div className="grid w-full max-w-sm gap-3">
      <Input
        aria-label={t('treeList.examples.searchNavigation')}
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
      <NavigateContext.Provider value={setCurrentHref}>
        <LinkProvider component={PreviewLink}>
          <TreeList
            aria-label={t('treeList.examples.navigation')}
            nodes={nodes}
            filter={filter}
            currentHref={currentHref}
            defaultExpanded={['documentation']}
            className="rounded-lg border border-border bg-card p-1.5"
          />
        </LinkProvider>
      </NavigateContext.Provider>
    </div>
  );
}
