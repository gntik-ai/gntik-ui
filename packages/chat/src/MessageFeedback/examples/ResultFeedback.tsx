import { I18nProvider, Stack } from '@gntik-ai/ui';
import MessageFeedbackReply from './MessageFeedbackReply';

/** Copy actions use the active catalog for successful and failed clipboard results. */
export default function ResultFeedback() {
  return (
    <Stack gap={6}>
      <MessageFeedbackReply />
      <I18nProvider locale="es">
        <MessageFeedbackReply />
      </I18nProvider>
    </Stack>
  );
}
