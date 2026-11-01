import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'useConversations',
  group: 'Feedback',
  status: 'experimental',
  description:
    'Experimental local conversation state beside useChat. ChatConversation reuses ConversationSummary (id, title, required updatedAt, preview, unread, icon, disabled) plus optional metadata. Options: defaultConversations (empty), defaultActiveId (null), controlled activeId, onActiveChange(id | null), onConversationsChange(list). Returns conversations, activeId, setActiveId, addConversation(item, placement?), setConversation(id, patch | updater), removeConversation, getConversation, setConversations, getMessages and setMessages. Add prepends by default, append opts out, duplicates return false. Patches cannot change id; unknown ids are ignored. Removal selects the next item, then previous, then null; controlled ids pass through unchanged until the prop changes, even when absent from the list. List and selection callbacks run once per change, never on mount. getMessages is not reactive: setMessages stores an array by reference without rendering; missing ids share a frozen empty array. Render previews from preview and updatedAt, and supply timestamps yourself. Removal drops stored messages. Each hook instance is independent; persistence belongs to the product. The echo example shows adding, renaming, removing, switching and restoring histories. Its owning-id ref skips stale write-back during the useChat id-reset effect.',
};
