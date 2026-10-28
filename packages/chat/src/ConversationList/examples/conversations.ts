import { useChatI18n } from '../../utils/i18n';
import type { ConversationSummary } from '../types';

export const exampleNow = new Date(2026, 2, 10, 12);

export function useExampleConversations(): ConversationSummary[] {
  const { tc } = useChatI18n();
  return [
    {
      id: 'a',
      title: tc('chat.historyExampleBudget'),
      preview: tc('chat.historyExamplePreview'),
      updatedAt: new Date(2026, 2, 10, 9),
      unread: 3,
    },
    { id: 'b', title: tc('chat.historyExamplePlan'), updatedAt: new Date(2026, 2, 9, 18) },
    { id: 'c', title: tc('chat.historyExampleRelease'), updatedAt: new Date(2026, 2, 6, 10) },
    { id: 'd', title: tc('chat.historyExampleEarlier'), updatedAt: new Date(2026, 1, 1, 10) },
  ];
}
