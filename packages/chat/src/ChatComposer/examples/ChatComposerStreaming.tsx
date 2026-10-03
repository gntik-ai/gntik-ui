import { useState } from 'react';
import { ChatComposer } from '../ChatComposer';

export default function ChatComposerStreaming() {
  const [streaming, setStreaming] = useState(true);
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <ChatComposer streaming={streaming} onStop={() => setStreaming(false)} onSubmit={() => setStreaming(true)} />
      <ChatComposer disabled placeholder="Read-only conversation" onSubmit={() => {}} hint={null} />
    </div>
  );
}
