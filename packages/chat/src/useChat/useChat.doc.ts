import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'useChat',
  group: 'Feedback',
  status: 'experimental',
  description:
    'Experimental streaming conversation runtime: useChat({ adapter, id, initialMessages, initialCursor, flushIntervalMs, generateId, onFinish, onError }) returns messages, isStreaming, error, sendMessage(text, attachments?), stop(), regenerate(messageId?), setMessages(next), loadOlder(), hasOlder and isLoadingOlder. Busy sends are ignored. Messages hold text, reasoning, tool, source, file and step parts. applyChunk is a pure UI-message-stream v1 reducer; unknown chunk types are ignored. Stop and unmount abort the adapter signal and retain partial parts; failed replies call onError once. State updates batch every 50 ms (0 commits every chunk). A changed conversation id aborts and resets. createEchoAdapter runs locally; createHttpChatAdapter reads UI-stream SSE and createOpenAICompatibleAdapter maps text-only chat-completions SSE. Both reuse readSSE and check HTTP status first. Their URL must be the product backend: provider keys stay server-side. Map pending/streaming to ChatMessage.streaming, and terminal replies to onRetry; ChatMessage has no status prop. See the chat runtime guide on this page for the protocol, history, abort and part mapping.',
};
