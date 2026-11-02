import { useState } from 'react';
import { Markdown, ModelPicker } from '@gntik-ai/chat';
import { CodeEditor, DiffEditor } from '@gntik-ai/editor';
import {
  Button,
  CodeBlock,
  JsonViewer,
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  Separator,
  Terminal,
  ThemeScope,
  useTheme,
} from '@gntik-ai/ui';

// This preview runs in its own iframe. It temporarily gives navy opt-in typography;
// the shipped navy palette and its colours are unchanged.
const previewPalette = `
[data-palette="navy"] {
  --font-sans: "Inter", "Geist", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "Courier New", monospace;
  --font-style-emphasis: normal;
  --text-transform-label: none;
}`;
const original = '// Original comment\nconst count = 1;';
const modified = '// Modified comment\nconst count = 2;';

function Editors({ label }: { label: string }) {
  return (
    <div className="space-y-3" data-editors={label}>
      <CodeEditor defaultValue={original} language="javascript" height={120} aria-label={`${label} code`} />
      <DiffEditor
        original={original}
        modified={modified}
        language="javascript"
        height={140}
        aria-label={`${label} diff`}
      />
    </div>
  );
}

export default function PaletteTypography() {
  const { resolved, setMode } = useTheme();
  const [custom, setCustom] = useState(true);
  const [palette, setPalette] = useState<'navy' | 'green'>('navy');
  return (
    <section className="space-y-6 p-6" aria-label="Typography in palettes">
      {custom && <style>{previewPalette}</style>}
      <h1 className="text-heading-lg">Typography in palettes</h1>
      <p>
        This example opts into self-hosted Inter, upright emphasis and sentence-case labels. Editors follow the mono
        font; editor colours follow the page theme. Green restores the defaults, including in nested scopes.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setCustom(!custom);
            setPalette(custom ? 'green' : 'navy');
          }}
          aria-pressed={custom}
        >
          Custom typography
        </Button>
        <Button onClick={() => setPalette(palette === 'navy' ? 'green' : 'navy')}>Switch scope palette</Button>
        {(['dark', 'light', 'high_contrast'] as const).map((theme) => (
          <Button key={theme} onClick={() => setMode(theme)} aria-pressed={resolved === theme}>
            {theme}
          </Button>
        ))}
      </div>
      <ThemeScope
        theme={resolved}
        data-palette={palette}
        data-typography-scope
        className="space-y-4 rounded-lg border border-border bg-background p-4 text-foreground"
      >
        <p>
          <em>Scoped emphasis</em> and <i>scoped italic</i>
        </p>
        <Separator label="Scope label" labelStyle="kicker" />
        <Select defaultValue="one" items={[{ value: 'one', label: 'First option' }]} modal={false}>
          <SelectLabel>Typography choice</SelectLabel>
          <SelectTrigger />
          <SelectContent>
            <SelectGroup>
              <SelectGroupLabel>Available choices</SelectGroupLabel>
              <SelectItem value="one">
                <em>Portal emphasis</em>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <CodeBlock code="// CodeBlock comment" language="javascript" />
        <JsonViewer data={{ empty: null }} />
        <Markdown>{'![Preview](javascript:blocked)'}</Markdown>
        <Terminal lines={['\u001b[3mANSI emphasis\u001b[0m']} toolbar={false} />
        <ModelPicker
          label="Typography model"
          value={null}
          onValueChange={() => {}}
          models={[
            {
              id: 'local',
              name: 'Local model',
              provider: 'Local',
              disabled: true,
              disabledReason: 'Unavailable reason',
            },
          ]}
        />
        <Editors label="scoped" />
        <ThemeScope theme={resolved} data-palette="green" data-inner-typography-scope className="space-y-3">
          <p>
            <em>Nested emphasis</em>
          </p>
          <Editors label="inner" />
        </ThemeScope>
      </ThemeScope>
      <div data-html-card className="bg-card">
        <Editors label="sibling" />
      </div>
    </section>
  );
}
