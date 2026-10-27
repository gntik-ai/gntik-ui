import { MermaidDiagram, type DiagramView } from '@gntik-ai/chat/mermaid';
import { I18nProvider, Stack, useI18n } from '@gntik-ai/ui';
import { useState } from 'react';

function States() {
  const { t: tc } = useI18n();
  const [view, setView] = useState<DiagramView>('code');
  return (
    <Stack gap={4}>
      <MermaidDiagram
        code="graph TD; A-->B"
        defaultView="code"
        onViewChange={setView}
        label={tc('chat.diagram')}
        className="max-w-xl"
      />
      <output>{tc(view === 'code' ? 'chat.showCode' : 'chat.showDiagram')}</output>
      <MermaidDiagram code="graph TD; A-->" />
      <MermaidDiagram code="graph TD; A-->" streaming />
    </Stack>
  );
}

/** Code-first, failed and streaming states, including Spanish controls and status. */
export default function MermaidDiagramStates() {
  return (
    <I18nProvider locale="es">
      <States />
    </I18nProvider>
  );
}
