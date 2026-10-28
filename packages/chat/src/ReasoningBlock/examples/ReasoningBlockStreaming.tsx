import { Button, useI18n } from '@gntik-ai/ui';
import { useState } from 'react';
import { ChatAnnouncer, ChatMessage } from '../../ChatMessage';
import { Markdown } from '../../Markdown';
import { useChatI18n } from '../../utils/i18n';
import { ReasoningBlock } from '../ReasoningBlock';

const trace = 'Check the latest deployment, then compare its health checks. [Read the guide](/guide).';
const answer = 'The deployment succeeded.';

/** Step through the same phases a reasoning model emits, without a backend or timers. */
export default function ReasoningBlockStreaming() {
  const { t } = useI18n();
  const { tc } = useChatI18n();
  const [phase, setPhase] = useState<'thinking' | 'responding' | 'done'>('thinking');
  const [open, setOpen] = useState(false);
  const thinking = phase === 'thinking';
  const streaming = phase !== 'done';
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Button variant="secondary" onClick={() => setPhase(thinking ? 'responding' : streaming ? 'done' : 'thinking')}>
        {t(thinking ? 'common.next' : streaming ? 'common.finish' : 'common.retry')}
      </Button>
      <ChatMessage role="assistant" streaming={streaming}>
        <ReasoningBlock streaming={thinking} durationMs={thinking ? undefined : 12000} className="mb-3">
          {trace}
        </ReasoningBlock>
        {!thinking && <Markdown streaming={streaming}>{answer}</Markdown>}
      </ChatMessage>
      <ChatAnnouncer streaming={streaming} reasoning={thinking} lastReply={answer} />
      <ReasoningBlock durationMs={65000}>{trace}</ReasoningBlock>
      <ReasoningBlock defaultOpen>{trace}</ReasoningBlock>
      <ReasoningBlock open={open} onOpenChange={setOpen} label={<strong>{tc('chat.reasoning')}</strong>}>
        <p>The application controls this disclosure and supplies its own body and label.</p>
      </ReasoningBlock>
    </div>
  );
}
