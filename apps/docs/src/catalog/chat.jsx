/* ============================================================================
   Gntik UI · chat.jsx — @gntik-ai/chat, rendered live.
   Same contract as the ui Library: every component folder in packages/chat
   contributes its *.doc.ts and its examples/*.tsx (preview and copyable code
   are one file), followed by the generated API reference. A new chat component
   shows up here with no registration (package-docs.jsx has the shared page).
   ============================================================================ */
import { buildEntries, sortEntries, PackageDocs } from './package-docs.jsx';

const docs = import.meta.glob('../../../../packages/chat/src/*/*.doc.ts', { eager: true, import: 'doc' });
// Whole modules: helper files in examples/ have no default export.
const exampleModules = import.meta.glob('../../../../packages/chat/src/*/examples/*.tsx', { eager: true });
const sources = import.meta.glob('../../../../packages/chat/src/*/examples/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const examples = Object.fromEntries(
  Object.entries(exampleModules)
    .filter(([, m]) => typeof m.default === 'function')
    .map(([p, m]) => [p, m.default]),
);

// Examples import their siblings relatively ('../ChatMessage', '../../Markdown'); an app imports the package.
const forProduct = (code) => code.replace(/from '(\.\.\/)+[A-Za-z]+(\/[A-Za-z.]+)?'/g, "from '@gntik-ai/chat'");

const ENTRIES = sortEntries(
  buildEntries({
    docs,
    examples,
    sources,
    folderOf: (path) => path.split('/chat/src/')[1].split('/')[0],
    forProduct,
    apiKind: 'chat',
  }),
);

function ChatSection() {
  return (
    <PackageDocs
      kicker="Chat"
      title="@gntik-ai/chat"
      idPrefix="chat"
      entries={ENTRIES}
      intro={`${ENTRIES.length} components for AI assistant screens: messages with streaming Markdown, a composer with attachments, tool calls, citations, feedback, a model picker and a typing indicator. They build on @gntik-ai/ui, so install both. Each example below is the real file from the package — the preview and the code are the same source. Every keyboard row is covered by a test, and every example passes axe.`}
    />
  );
}

window.SECTIONS = window.SECTIONS || {};
window.SECTIONS['chat-components'] = ChatSection;

// ES module marker: the dev server compiles module files with the automatic JSX runtime.
export {};
