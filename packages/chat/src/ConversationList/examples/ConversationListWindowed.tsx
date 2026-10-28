import { useChatI18n } from '../../utils/i18n';
import { ConversationList } from '../ConversationList';
import { exampleNow } from './conversations';

export default function ConversationListWindowed() {
  const { tc } = useChatI18n();
  const items = Array.from({ length: 1000 }, (_, number) => ({
    id: `history-${number}`,
    title: tc('chat.historyExampleNumber', { number: number + 1 }),
    preview: number % 2 ? tc('chat.historyExamplePreview') : undefined,
    updatedAt: exampleNow,
  }));
  return (
    <div className="h-[600px] max-w-sm rounded-lg border border-border">
      <ConversationList items={items} now={exampleNow} virtualizeAt={100} defaultActiveId="history-5" />
    </div>
  );
}
