import { Button } from '@gntik-ai/ui';
import { useState } from 'react';
import { useChatI18n } from '../../utils/i18n';
import { ConversationList } from '../ConversationList';
import { exampleNow, useExampleConversations } from './conversations';

export default function ConversationListLinks() {
  const { tc } = useChatI18n();
  const items = useExampleConversations();
  const [custom, setCustom] = useState(false);
  return (
    <div className="max-w-sm space-y-3">
      <Button variant="secondary" size="sm" aria-pressed={custom} onClick={() => setCustom((value) => !value)}>
        {tc('chat.historyExampleCustomGroups')}
      </Button>
      <div className="h-[300px] rounded-lg border border-border">
        <ConversationList
          items={items.map((item) => ({ ...item, disabled: item.id === 'c' }))}
          now={exampleNow}
          label={tc('chat.conversations')}
          groupBy={custom ? (item) => (item.id === 'a' ? tc('chat.today') : tc('chat.older')) : false}
          defaultCollapsedGroups={[tc('chat.older')]}
          defaultActiveId="b"
          getHref={(item) => `#conversation-${item.id}`}
        />
      </div>
    </div>
  );
}
