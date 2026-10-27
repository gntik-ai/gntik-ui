import { Badge, Button } from '@gntik-ai/ui';
import { useRef, useState } from 'react';
import { useChatI18n } from '../../utils/i18n';
import { ChatComposer, type ChatComposerActions } from '../ChatComposer';
import { ChatComposerHeader } from '../ChatComposerHeader';

/** Apply controlled updates synchronously so insert can restore the caret after rendering. */
export default function ChatComposerQuoteReply() {
  const { tc } = useChatI18n();
  const [value, setValue] = useState(tc('chat.composerGreeting'));
  const [replying, setReplying] = useState(true);
  const [current, setCurrent] = useState<string | null>(null);
  const actions = useRef<ChatComposerActions>(null);
  return (
    <ChatComposer
      value={value}
      onValueChange={setValue}
      actionsRef={actions}
      header={
        replying ? (
          <ChatComposerHeader title={tc('chat.composerReplyTitle', { name: 'Ana' })} onClose={() => setReplying(false)}>
            {tc('chat.composerQuote')}
          </ChatComposerHeader>
        ) : null
      }
      prefix={<Badge>{tc('chat.composerAgent')}</Badge>}
      tools={
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="ghost" onClick={() => actions.current?.insert('{{name}}')}>
            {tc('chat.composerInsert')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => actions.current?.clear()}>
            {tc('chat.composerClear')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => actions.current?.focus('all')}>
            {tc('chat.composerSelect')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setCurrent(actions.current?.getValue() ?? '')}>
            {tc('chat.composerRead')}
          </Button>
        </div>
      }
      footer={
        <span role="status">
          {current === null ? tc('chat.composerReview') : tc('chat.composerCurrent', { text: current })}
        </span>
      }
      onSubmit={(text) => {
        setCurrent(text);
        setValue('');
      }}
    />
  );
}
