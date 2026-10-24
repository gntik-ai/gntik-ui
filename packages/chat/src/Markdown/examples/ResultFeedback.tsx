import { I18nProvider, Stack } from '@gntik-ai/ui';
import MarkdownReply from './MarkdownReply';

/** Copy actions use the active catalog for successful and failed clipboard results. */
export default function ResultFeedback() {
  return (
    <Stack gap={6}>
      <MarkdownReply />
      <I18nProvider locale="es">
        <MarkdownReply />
      </I18nProvider>
    </Stack>
  );
}
