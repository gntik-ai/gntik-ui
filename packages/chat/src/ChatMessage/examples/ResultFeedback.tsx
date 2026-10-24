import { I18nProvider, Stack } from '@gntik-ai/ui';
import ChatMessageRoles from './ChatMessageRoles';

/** Copy actions use the active catalog for successful and failed clipboard results. */
export default function ResultFeedback() {
  return (
    <Stack gap={6}>
      <ChatMessageRoles />
      <I18nProvider locale="es">
        <ChatMessageRoles />
      </I18nProvider>
    </Stack>
  );
}
