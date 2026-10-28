import { MessageSquare } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useChatI18n } from '../../utils/i18n';
import { ConversationList } from '../ConversationList';
import { exampleNow, useExampleConversations } from './conversations';

/** Application state drives this presentational list; no storage or key binding is built in. */
export default function ConversationListGrouped() {
  const { tc, t } = useChatI18n();
  const initial = useExampleConversations();
  const [items, setItems] = useState(initial);
  const [active, setActive] = useState<string | null>('a');
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <div className="h-[440px] max-w-sm rounded-lg border border-border py-2">
      <ConversationList
        items={items.map((item) => ({
          ...item,
          icon: <MessageSquare size={16} aria-hidden className="shrink-0 text-muted-foreground" />,
        }))}
        now={exampleNow}
        activeId={active}
        onActiveChange={(id) => {
          setActive(id);
          setItems((list) => list.map((item) => (item.id === id ? { ...item, unread: 0 } : item)));
        }}
        collapsedGroups={collapsed}
        onCollapsedGroupsChange={setCollapsed}
        onRename={(id, title) => setItems((list) => list.map((item) => (item.id === id ? { ...item, title } : item)))}
        onDelete={(id) => setItems((list) => list.filter((item) => item.id !== id))}
        itemActions={(item) => [
          {
            label: t('common.copy'),
            onSelect: () => {
              void navigator.clipboard?.writeText(item.title).catch(() => {});
            },
          },
        ]}
        emptyState={<p className="p-3 text-sm text-muted-foreground">{tc('chat.historyExampleEmpty')}</p>}
        onNew={() => {
          const id = `new-${Date.now()}`;
          setItems((list) => [{ id, title: tc('chat.newChat'), updatedAt: exampleNow }, ...list]);
          setActive(id);
          setCollapsed((keys) => keys.filter((key) => key !== 'today'));
        }}
        newShortcut="⌘N"
        hasMore={hasMore}
        loadingMore={loading}
        onLoadMore={() => {
          setLoading(true);
          timer.current = setTimeout(() => {
            setItems((list) => [
              ...list,
              { id: 'loaded', title: tc('chat.historyExampleNumber', { number: 5 }), updatedAt: new Date(2026, 0, 1) },
            ]);
            setLoading(false);
            setHasMore(false);
          }, 600);
        }}
      />
    </div>
  );
}
