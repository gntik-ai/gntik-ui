import { useCallback, useRef } from 'react';
import { PALETTES } from '@gntik-ai/tokens/runtime';
import { ThemeProvider, useTheme, themeScript } from '../ThemeProvider';
import { gntikPreset } from '../presets';
import { ThemeScope } from '../ThemeScope';
import { Button } from '../../components/Button/Button';
import { CodeBlock } from '../../components/CodeBlock/CodeBlock';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger } from '../../components/Select/Select';

const navyPreset = { ...gntikPreset, palette: 'navy' as const };

function PalettePreview() {
  const { palette, setPalette } = useTheme();
  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-4 text-foreground">
      <p>Active palette: {palette}</p>
      <div className="flex gap-2">
        {PALETTES.map((id) => (
          <Button key={id} aria-pressed={palette === id} onClick={() => setPalette(id)}>
            {id === 'navy' ? 'Navy' : 'Green'}
          </Button>
        ))}
      </div>
      <p className="text-success-text">Success stays independent of the brand colour.</p>
      <ThemeScope theme="light" data-palette="navy" className="space-y-2 rounded-lg bg-card p-4 text-card-foreground">
        <p className="text-primary-text">Navy light scope with a matching overlay</p>
        <Select defaultValue="one" items={[{ value: 'one', label: 'First option' }]}>
          <SelectLabel>Palette preview choice</SelectLabel>
          <SelectTrigger />
          <SelectContent>
            <SelectItem value="one">First option</SelectItem>
          </SelectContent>
        </Select>
      </ThemeScope>
    </div>
  );
}

/** The local target leaves the catalog controls independent. Storage is opt-in. */
export default function ThemeProviderPalette() {
  const ref = useRef<HTMLDivElement>(null);
  const target = useCallback(() => ref.current, []);
  return (
    <div ref={ref} className="space-y-4">
      <ThemeProvider
        brand={navyPreset}
        palette="navy"
        paletteStorageKey="docs-example-palette"
        storageKey={null}
        target={target}
      >
        <PalettePreview />
      </ThemeProvider>
      <CodeBlock
        code={themeScript('gntik-theme', 'dark', { palette: 'navy', paletteStorageKey: 'docs-example-palette' })}
      />
    </div>
  );
}
