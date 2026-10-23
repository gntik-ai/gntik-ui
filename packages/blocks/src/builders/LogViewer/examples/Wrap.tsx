import { useState } from 'react';
import { Button, I18nProvider, Stack, Switch } from '@gntik-ai/ui';
import { LogViewer } from '../LogViewer';
import { makeLogLines } from '../fixtures';

const initialLines = makeLogLines(40).map((line, index) => ({
  ...line,
  message:
    index === 0
      ? `Long message ${'with full details for inspection. '.repeat(16)}`.slice(0, 500)
      : index === 1
        ? 'x'.repeat(200)
        : line.message,
}));

export default function Wrap() {
  const [lines, setLines] = useState(initialLines);
  const [selected, setSelected] = useState('');
  const [spanish, setSpanish] = useState(false);
  const [override, setOverride] = useState(false);
  return (
    <Stack gap={4}>
      <p className="text-[13px] text-muted-foreground">
        Wrap full messages, including unbroken tokens. Follow the stream while appending lines, or scroll up to inspect.
        Level names use the catalog unless overridden.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() =>
            setLines((current) => [
              ...current,
              {
                ...makeLogLines(current.length + 1)[current.length]!,
                message: 'Appended full message with details that wrap across several lines.',
              },
            ])
          }
        >
          Append line
        </Button>
        <Switch label="Spanish catalog" checked={spanish} onCheckedChange={setSpanish} />
        <Switch label="Override warning label" checked={override} onCheckedChange={setOverride} />
      </div>
      <I18nProvider locale={spanish ? 'es' : 'en'}>
        <LogViewer
          lines={lines}
          wrap
          title="Wrapped logs"
          height={240}
          rowHeight={24}
          defaultFollow={false}
          onSelectLine={(line) => setSelected(line.id)}
          selectedLineId={selected}
          labels={override ? { levels: { warn: 'Caution' } } : undefined}
        />
      </I18nProvider>
      <p role="status" className="text-[13px] text-muted-foreground">
        {selected ? `Selected ${selected}` : 'Select a line to inspect it.'}
      </p>
    </Stack>
  );
}
