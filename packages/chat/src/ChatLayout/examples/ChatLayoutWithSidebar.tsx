import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  useBreakpointValue,
} from '@gntik-ai/ui';
import { useState } from 'react';
import { ConversationList } from '../../ConversationList';
import { exampleNow, useExampleConversations } from '../../ConversationList/examples/conversations';
import { ChatComposer } from '../../ChatComposer';
import { ChatMessage } from '../../ChatMessage';
import { useChatI18n } from '../../utils/i18n';
import { ChatLayout } from '../ChatLayout';

/** Responsive overlay behaviour belongs to the app, not ChatLayout. */
export default function ChatLayoutWithSidebar() {
  const { tc, t } = useChatI18n();
  const wide = useBreakpointValue({ base: false, md: true });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>('a');
  const items = useExampleConversations();
  const history = (
    <ConversationList
      items={items}
      now={exampleNow}
      activeId={active}
      onActiveChange={(id) => {
        setActive(id);
        setOpen(false);
      }}
    />
  );
  return (
    <div className="h-[480px] overflow-hidden rounded-xl border border-border">
      <Drawer side="left" open={open && !wide} onOpenChange={setOpen}>
        <ChatLayout
          sidebar={wide ? history : undefined}
          sidebarWidth={300}
          header={
            <div className="flex items-center gap-3 p-3">
              {!wide && (
                <DrawerTrigger render={<Button variant="secondary" size="sm" />}>
                  {tc('chat.conversations')}
                </DrawerTrigger>
              )}
              <span>{items.find((item) => item.id === active)?.title}</span>
            </div>
          }
          composer={<ChatComposer onSubmit={() => {}} hint={null} />}
          panel={<p className="p-4 text-sm">{t('chat.details')}</p>}
        >
          <ChatMessage role="assistant">{tc('chat.historyExamplePreview')}</ChatMessage>
        </ChatLayout>
        {!wide && (
          <DrawerContent size="sm" aria-describedby={undefined}>
            <DrawerHeader>
              <DrawerTitle>{tc('chat.conversations')}</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>{history}</DrawerBody>
          </DrawerContent>
        )}
      </Drawer>
    </div>
  );
}
