import { useCallback, useRef, useState } from 'react';
import type { ConversationSummary } from '../ConversationList';
import type { ChatThreadMessage } from '../useChat';

const EMPTY_MESSAGES: never[] = [];
Object.freeze(EMPTY_MESSAGES);

/** A conversation summary with optional product-owned metadata.
 * @experimental
 */
export type ChatConversation = ConversationSummary & { metadata?: Record<string, unknown> };

/** Configuration for local conversation state. Defaults are read on mount.
 * @experimental
 */
export interface UseConversationsOptions {
  defaultConversations?: ChatConversation[];
  defaultActiveId?: string | null;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  onConversationsChange?: (conversations: ChatConversation[]) => void;
}

/** Local conversation summaries, selection and per-conversation messages.
 * `getMessages` is not reactive: `setMessages` stores the supplied array by reference without
 * rendering. Missing ids return one frozen empty array; treat it as read-only. Render list
 * previews from `preview` / `updatedAt`, updating them with `setConversation` as needed.
 * Conversations must supply `updatedAt`; the hook never stamps time. Controlled `activeId`
 * passes through even if missing from the list; selection requests ignore unknown ids.
 * Removing the active item selects its next neighbour, then previous, then null.
 * Callbacks run once in the mutating handler, never on mount.
 * @experimental
 */
export function useConversations<TMessage = ChatThreadMessage>(options: UseConversationsOptions = {}) {
  const [conversations, commitConversations] = useState(options.defaultConversations ?? []);
  const current = useRef(conversations);
  const [internalActiveId, commitActiveId] = useState(options.defaultActiveId ?? null);
  const currentActiveId = useRef(internalActiveId);
  const activeId = options.activeId === undefined ? internalActiveId : options.activeId;
  const messages = useRef(new Map<string, TMessage[]>());
  const getMessages = useCallback((id: string): TMessage[] => messages.current.get(id) ?? EMPTY_MESSAGES, []);
  const setMessages = useCallback((id: string, next: TMessage[]) => {
    messages.current.set(id, next);
  }, []);

  const setActiveId = (id: string | null) => {
    if (id !== null && !current.current.some((item) => item.id === id)) return;
    const previous = options.activeId === undefined ? currentActiveId.current : options.activeId;
    if (id === previous) return;
    if (options.activeId === undefined) {
      currentActiveId.current = id;
      commitActiveId(id);
    }
    options.onActiveChange?.(id);
  };

  const addConversation = (conversation: ChatConversation, placement: 'prepend' | 'append' = 'prepend') => {
    if (current.current.some((item) => item.id === conversation.id)) return false;
    const next = placement === 'append' ? [...current.current, conversation] : [conversation, ...current.current];
    current.current = next;
    commitConversations(next);
    options.onConversationsChange?.(next);
    return true;
  };
  const getConversation = (id: string) => current.current.find((item) => item.id === id);
  const setConversation = (
    id: string,
    patch:
      | Partial<Omit<ChatConversation, 'id'>>
      | ((conversation: ChatConversation) => Partial<Omit<ChatConversation, 'id'>>),
  ) => {
    const conversation = getConversation(id);
    if (!conversation) return;
    const changes = typeof patch === 'function' ? patch(conversation) : patch;
    const next = current.current.map((item) => (item.id === id ? { ...item, ...changes, id } : item));
    current.current = next;
    commitConversations(next);
    options.onConversationsChange?.(next);
  };
  const removeConversation = (id: string) => {
    const index = current.current.findIndex((item) => item.id === id);
    if (index < 0) return;
    const previousActiveId = options.activeId === undefined ? currentActiveId.current : options.activeId;
    const next = current.current.filter((item) => item.id !== id);
    messages.current.delete(id);
    current.current = next;
    commitConversations(next);
    if (id === previousActiveId) setActiveId(next[index]?.id ?? next[index - 1]?.id ?? null);
    options.onConversationsChange?.(next);
  };
  const setConversations = (next: ChatConversation[]) => {
    current.current = next;
    commitConversations(next);
    options.onConversationsChange?.(next);
  };

  return {
    conversations,
    activeId,
    setActiveId,
    addConversation,
    getConversation,
    setConversation,
    removeConversation,
    setConversations,
    getMessages,
    setMessages,
  };
}
