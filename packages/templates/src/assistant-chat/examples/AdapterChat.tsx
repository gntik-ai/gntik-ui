import { createEchoAdapter } from '@gntik-ai/chat';
import AssistantChatPage from '../Page';

const adapter = createEchoAdapter();

/** The template's optional adapter streams the prompt back instead of running the scripted tool. */
export default function AdapterChat() {
  return <AssistantChatPage adapter={adapter} withPanel={false} />;
}
