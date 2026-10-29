import { ThemeScope, Button } from '@gntik-ai/ui';
const { SectionHead, CodeBlock } = window;

function Theming() {
  return (
    <div className="space-y-8">
      <SectionHead
        kicker="Foundations"
        title="Theming"
        status="done"
        intro="Choose a named colour palette independently of dark, light and shared high contrast."
      />
      <p className="text-sm text-muted-foreground">
        Green is the unchanged default. Navy covers the brand, neutrals and shadow tint. Presets may opt in through
        palette; no product changes its default automatically.
      </p>
      <CodeBlock
        code={`import { ThemeProvider, themeScript } from '@gntik-ai/ui';
// In the document head, before styles and hydration:
themeScript('gntik-theme', 'dark', { palette: 'navy', paletteStorageKey: 'my-palette' });
// Omit paletteStorageKey to keep palette selection in memory only.
<ThemeProvider palette="navy" paletteStorageKey="my-palette"><App /></ThemeProvider>
// useTheme().palette and useTheme().setPalette('green') expose the current choice.`}
      />
      <div data-palette="navy" className="grid gap-4 sm:grid-cols-2">
        {['light', 'dark'].map((theme) => (
          <ThemeScope
            key={theme}
            theme={theme}
            className="space-y-3 rounded-lg border border-border bg-background p-6 text-foreground"
          >
            <h2 className="font-semibold">Navy {theme}</h2>
            <Button>Primary action</Button>
            <p className="text-success-text">Success text keeps its own green status colour.</p>
            <p className="text-sm text-muted-foreground">Overlays inherit the scope’s palette.</p>
          </ThemeScope>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Navy moves info to hue 190. Categorical accents stay shared; the positive end of a diverging chart ramp follows
        primary and becomes blue. Every palette passes the same text, chip, focus and chart contrast checks. High
        contrast uses the shared frozen values.
      </p>
      <p className="text-sm text-muted-foreground">
        Import @gntik-ai/ui/styles.css or @gntik-ai/tokens/tailwind.css for all palettes. For a subtree, set
        data-palette="navy"; a nested ThemeScope restores that palette’s light or dark values and carries it to portals.
        JavaScript colour consumers use currentPalette and observeTheme from @gntik-ai/tokens/runtime; token values
        remain in CSS.
      </p>
    </div>
  );
}
window.SECTIONS['theming'] = Theming;
