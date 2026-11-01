import { useI18n } from '@gntik-ai/ui';
import { chatRuntimeMessages } from '../i18n/chat-runtime-messages';

/** Integration guide shown on the chat package page, next to the live useChat example. */
export default function ChatRuntimeGuide() {
  const { locale } = useI18n();
  const copy = chatRuntimeMessages[locale.split('-')[0]] ?? chatRuntimeMessages.en;
  const { CodeBlock } = window;
  return (
    <section id="chat-runtime" className="space-y-4 text-foreground">
      <h2 className="text-xl font-semibold">{copy.title}</h2>
      <p>{copy.intro}</p>
      <h3 className="text-lg font-semibold">{copy.backendTitle}</h3>
      <p>{copy.backend}</p>
      <p>{copy.adapters}</p>
      <CodeBlock
        lang="ts"
        code={`// Product backend: /api/chat-completions (server-only).
export async function POST(request: Request) {
  // Implement authentication, conversation authorization and schema validation in your app.
  const payload = await authorizeAndValidateChat(request);
  const upstream = await fetch(process.env.CHAT_PROVIDER_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.CHAT_PROVIDER_KEY,
    },
    body: JSON.stringify({ ...payload, stream: true }),
    signal: request.signal,
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}`}
      />
      <CodeBlock
        lang="tsx"
        code={`import { createHttpChatAdapter, createOpenAICompatibleAdapter, useChat } from '@gntik-ai/chat';
const adapter = createHttpChatAdapter({ url: '/api/chat' });
// Or a text-only chat-completions proxy:
const completions = createOpenAICompatibleAdapter({ url: '/api/chat-completions', model: 'your-model' });
function Conversation() {
  const { messages, isStreaming, sendMessage, stop, regenerate } = useChat({ adapter });
  // <ChatComposer onSubmit={sendMessage} streaming={isStreaming} onStop={stop} />
}`}
      />
      <h3 className="text-lg font-semibold">{copy.protocolTitle}</h3>
      <p>{copy.protocol}</p>
      <CodeBlock
        lang="text"
        code={`data: {"type":"start"}

data: {"type":"reasoning-delta","id":"r1","delta":"Checking…"}

data: {"type":"reasoning-end","id":"r1"}

data: {"type":"tool-input-available","toolCallId":"t1","toolName":"search","input":{"query":"hello"}}

data: {"type":"tool-output-available","toolCallId":"t1","output":["found"]}

data: {"type":"text-start","id":"text-1"}

data: {"type":"text-delta","id":"text-1","delta":"Hello"}

data: {"type":"text-end","id":"text-1"}

data: {"type":"source-url","sourceId":"s1","url":"https://example.com","title":"Example"}

data: {"type":"finish"}

data: [DONE]

`}
      />
      <h3 className="text-lg font-semibold">{copy.mappingTitle}</h3>
      <p>{copy.mapping}</p>
      <p>{copy.status}</p>
      <CodeBlock
        lang="tsx"
        code={`const streaming = message.status === 'pending' || message.status === 'streaming';
<ChatMessage role={message.role} streaming={streaming}
  onRetry={message.role === 'assistant' && !isStreaming ? () => regenerate(message.id) : undefined}>
  {message.parts.filter(p => p.type === 'text').map(p =>
    <Markdown key={p.id} streaming={streaming}>{p.text}</Markdown>)}
</ChatMessage>`}
      />
      <h3 className="text-lg font-semibold">{copy.controlTitle}</h3>
      <p>{copy.control}</p>
      <p>{copy.history}</p>
      <h3 className="text-lg font-semibold">{copy.templateTitle}</h3>
      <p>{copy.template}</p>
      <CodeBlock
        lang="tsx"
        code={`import { createEchoAdapter } from '@gntik-ai/chat';
import { AssistantChatPage } from '@gntik-ai/templates';
const adapter = createEchoAdapter();
<AssistantChatPage adapter={adapter} withPanel={false} />;`}
      />
      <iframe
        title={copy.templateTitle}
        src="/preview.html?kind=template&id=assistant-chat--adapter"
        className="h-[800px] w-full rounded-lg border border-border"
      />
    </section>
  );
}
