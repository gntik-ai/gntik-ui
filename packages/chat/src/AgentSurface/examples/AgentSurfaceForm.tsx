import { Button, Stack, Text } from '@gntik-ai/ui';
import { useState } from 'react';
import { useChatI18n } from '../../utils/i18n';
import { AgentSurface } from '../AgentSurface';
import { defaultAgentCatalog } from '../catalog';
import { A2UI_VERSION, type A2uiMessage } from '../protocol';

/** Transport belongs to the consumer. This example appends commands locally. */
export default function AgentSurfaceForm() {
  const { tc } = useChatI18n();
  function initial(): A2uiMessage[] {
    return [
      { version: A2UI_VERSION, createSurface: { surfaceId: 's1' } },
      {
        version: A2UI_VERSION,
        updateDataModel: {
          surfaceId: 's1',
          value: { user: { name: 'Ana' }, language: 'en', notify: false, submitted: false },
        },
      },
      {
        version: A2UI_VERSION,
        updateComponents: {
          surfaceId: 's1',
          components: [
            { id: 'root', component: 'Card', children: ['stack'] },
            {
              id: 'stack',
              component: 'Stack',
              direction: 'column',
              gap: 3,
              children: ['heading', 'badge', 'notice', 'name', 'echo', 'language', 'notify', 'link', 'submit'],
            },
            { id: 'heading', component: 'Heading', text: tc('chat.surfaceExampleTitle'), level: 2 },
            { id: 'badge', component: 'Badge', text: tc('chat.surfaceExampleBadge') },
            {
              id: 'notice',
              component: 'Alert',
              title: tc('chat.surfaceExampleTitle'),
              text: tc('chat.surfaceExampleNotice'),
            },
            {
              id: 'name',
              component: 'Input',
              disabled: { path: '/submitted' },
              label: tc('chat.surfaceExampleName'),
              value: { path: '/user/name' },
            },
            { id: 'echo', component: 'Text', text: { path: '/user/name' } },
            {
              id: 'language',
              component: 'Select',
              disabled: { path: '/submitted' },
              label: tc('chat.surfaceExampleChoice'),
              value: { path: '/language' },
              options: [
                { value: 'en', label: tc('chat.surfaceExampleEnglish') },
                { value: 'es', label: tc('chat.surfaceExampleSpanish') },
              ],
            },
            {
              id: 'notify',
              component: 'Checkbox',
              disabled: { path: '/submitted' },
              label: tc('chat.surfaceExampleNotify'),
              checked: { path: '/notify' },
            },
            { id: 'link', component: 'Text', text: tc('chat.surfaceExampleLink'), href: 'https://ui.gntik.ai' },
            {
              id: 'submit',
              component: 'Button',
              disabled: { path: '/submitted' },
              label: tc('chat.surfaceExampleSubmit'),
              action: {
                name: 'submit',
                context: {
                  name: { path: '/user/name' },
                  language: { path: '/language' },
                  notify: { path: '/notify' },
                },
              },
            },
          ],
        },
      },
    ];
  }
  const [messages, setMessages] = useState(initial);
  const [removed, setRemoved] = useState(false);
  const [status, setStatus] = useState('');
  const append = (message: A2uiMessage) => setMessages((current) => [...current, message]);
  return (
    <Stack gap={3}>
      <AgentSurface
        messages={messages}
        catalog={defaultAgentCatalog}
        onAction={({ context }) => {
          setStatus(tc('chat.surfaceExampleStatus', { name: String(context.name ?? '') }));
          append({ version: A2UI_VERSION, updateDataModel: { surfaceId: 's1', path: '/submitted', value: true } });
        }}
        onError={() => setStatus(tc('chat.surfaceExampleRejected'))}
      />
      <Stack direction="row" gap={2} wrap>
        <Button
          variant="secondary"
          disabled={removed}
          onClick={() =>
            append({ version: A2UI_VERSION, updateDataModel: { surfaceId: 's1', path: '/user/name', value: 'Bea' } })
          }
        >
          {tc('chat.surfaceExamplePatch')}
        </Button>
        <Button
          variant="secondary"
          disabled={removed}
          onClick={() =>
            append({
              version: A2UI_VERSION,
              updateComponents: { surfaceId: 's1', components: [{ id: 'root', component: 'Iframe' }] },
            })
          }
        >
          {tc('chat.surfaceExampleUnsupported')}
        </Button>
        <Button
          variant="secondary"
          disabled={removed}
          onClick={() => {
            append({ version: A2UI_VERSION, deleteSurface: { surfaceId: 's1' } });
            setRemoved(true);
          }}
        >
          {tc('chat.surfaceExampleRemove')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setMessages(initial());
            setRemoved(false);
            setStatus('');
          }}
        >
          {tc('chat.surfaceExampleReset')}
        </Button>
      </Stack>
      <Text role="status" aria-live="polite">
        {status}
      </Text>
    </Stack>
  );
}
