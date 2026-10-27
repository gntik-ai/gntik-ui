import { Button } from '@gntik-ai/ui';
import { useState } from 'react';
import { useChatI18n } from '../../utils/i18n';
import { ChatComposer } from '../ChatComposer';

export default function ChatComposerModEnter() {
  const { tc } = useChatI18n();
  const [readOnly, setReadOnly] = useState(false);
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <Button
        size="sm"
        variant="secondary"
        aria-pressed={readOnly}
        onClick={() => setReadOnly((previous) => !previous)}
      >
        {tc(readOnly ? 'chat.composerEdit' : 'chat.composerReadOnly')}
      </Button>
      <ChatComposer
        submitMode="mod+enter"
        readOnly={readOnly}
        value={value}
        onValueChange={setValue}
        onSubmit={(text) => {
          setSent(text);
          setValue('');
        }}
        footer={sent === null ? undefined : <span role="status">{tc('chat.composerCurrent', { text: sent })}</span>}
      />
    </div>
  );
}
