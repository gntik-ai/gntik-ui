import { test, expect } from '@playwright/test';
import { compile } from 'tailwindcss';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Independent colour-class references from origin/main d02a4b3. Keep all alphas:
// this catches a wrong role override as well as a wrong shared tone mapping.
const badge = {
  neutral: [
    'bg-muted-foreground/16 text-foreground',
    'border-border text-muted-foreground',
    'bg-foreground text-background',
    'bg-muted-foreground',
  ],
  primary: [
    'bg-primary/14 text-primary-chip-text',
    'border-primary/45 text-primary-text',
    'bg-primary text-primary-foreground',
    'bg-primary',
  ],
  success: [
    'bg-success/15 text-success-chip-text',
    'border-success/45 text-success-text',
    'bg-success text-primary-foreground',
    'bg-success',
  ],
  warning: [
    'bg-warning/16 text-warning-chip-text',
    'border-warning/50 text-warning-text',
    'bg-warning text-primary-foreground',
    'bg-warning',
  ],
  destructive: [
    'bg-destructive/15 text-destructive-chip-text',
    'border-destructive/45 text-destructive-text',
    'bg-destructive text-destructive-foreground',
    'bg-destructive',
  ],
  info: ['bg-info/15 text-foreground', 'border-info/45 text-foreground', 'bg-info text-background', 'bg-info'],
  violet: [
    'bg-category-violet/18 text-foreground',
    'border-category-violet/45 text-foreground',
    'bg-category-violet/30 text-foreground',
    'bg-category-violet',
  ],
  cyan: [
    'bg-category-cyan/18 text-foreground',
    'border-category-cyan/45 text-foreground',
    'bg-category-cyan/30 text-foreground',
    'bg-category-cyan',
  ],
  amber: [
    'bg-category-amber/20 text-foreground',
    'border-category-amber/50 text-foreground',
    'bg-category-amber/32 text-foreground',
    'bg-category-amber',
  ],
  rose: [
    'bg-category-rose/18 text-foreground',
    'border-category-rose/45 text-foreground',
    'bg-category-rose/30 text-foreground',
    'bg-category-rose',
  ],
};
const token = {
  neutral: ['border-border bg-background text-foreground', 'text-muted-foreground'],
  primary: ['border-primary/35 bg-primary/10 text-primary-chip-text', 'text-primary-text'],
  success: ['border-success/35 bg-success/10 text-success-chip-text', 'text-success-text'],
  warning: ['border-warning/40 bg-warning/12 text-warning-chip-text', 'text-warning-text'],
  destructive: ['border-destructive/35 bg-destructive/10 text-destructive-chip-text', 'text-destructive-text'],
};
const alert = {
  info: ['border-info/25 bg-info/10', 'text-info', 'text-foreground', 'text-muted-foreground hover:text-foreground'],
  success: ['border-success/25 bg-success/10', 'text-success-text', 'text-success-text', 'text-success-text'],
  warning: ['border-warning/30 bg-warning/10', 'text-warning-text', 'text-warning-text', 'text-warning-text'],
  destructive: [
    'border-destructive/30 bg-destructive/10',
    'text-destructive-text',
    'text-destructive-text',
    'text-destructive-text',
  ],
};
const progress = {
  primary: ['bg-primary', 'text-foreground'],
  success: ['bg-success', 'text-success-text'],
  warning: ['bg-warning', 'text-warning-text'],
  destructive: ['bg-destructive', 'text-destructive-text'],
};
let referenceCss;
test.beforeAll(async () => {
  const base = fileURLToPath(new URL('..', import.meta.url));
  const compiler = await compile(
    '@import "./node_modules/tailwindcss/index.css"; @import "../../packages/tokens/src/tailwind.css";',
    {
      base,
      async loadStylesheet(id, directory) {
        const file = path.resolve(directory, id);
        return { path: file, base: path.dirname(file), content: await fs.readFile(file, 'utf8') };
      },
    },
  );
  referenceCss = compiler.build(
    [
      ...Object.values(badge).flat(),
      ...Object.values(token).flat(),
      ...Object.values(alert).flat(),
      ...Object.values(progress).flat(),
      'bg-current',
      'bg-transparent',
    ].flatMap((classes) => classes.split(' ')),
  );
});

// Compare actual rendered kit slots with the original utilities in the same browser,
// avoiding browser-specific differences in colour serialization or mixing spaces.
async function sameColours(root, references) {
  const result = await root.evaluate((element, slots) => {
    const legacy = element.cloneNode(true);
    legacy.removeAttribute('data-tone');
    element.after(legacy);
    const colours = (node) => {
      const style = getComputedStyle(node);
      return [style.backgroundColor, style.borderTopColor, style.color];
    };
    const actual = [];
    const expected = [];
    for (const [selector, classes] of slots) {
      const original = selector ? element.querySelector(selector) : element;
      const reference = selector ? legacy.querySelector(selector) : legacy;
      if (!original || !reference) throw new Error(`Missing colour comparison slot: ${selector}`);
      reference.setAttribute('class', classes);
      actual.push(colours(original));
      expected.push(colours(reference));
    }
    legacy.remove();
    return { actual, expected };
  }, references);
  expect(result.actual).toEqual(result.expected);
}

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`shared tones preserve every display component colour / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=shared-tone-utilities&theme=${theme}`);
    await expect(page.locator('[data-example-tone]')).toHaveCount(10);
    await page.addStyleTag({ content: referenceCss });
    for (const [tone, [soft, outline, solid, dot]] of Object.entries(badge)) {
      for (const [variant, classes] of [
        ['soft', soft],
        ['outline', `bg-transparent ${outline}`],
        ['solid', solid],
      ]) {
        const root = page.locator(`[data-example-tone="${tone}"] [data-example-variant="${variant}"]`);
        await expect(root).toHaveAttribute('data-tone', tone);
        const solidDot = ['violet', 'cyan', 'amber', 'rose'].includes(tone) ? dot : 'bg-current';
        await sameColours(root, [
          ['', classes],
          ['[aria-hidden]', variant === 'solid' ? solidDot : dot],
        ]);
      }
    }
    for (const [tone, [root, leading]] of Object.entries(token)) {
      await sameColours(page.locator(`[data-example-kind="token"][data-tone="${tone}"]`), [
        ['', root],
        ['span:has(> [aria-hidden])', leading],
      ]);
    }
    for (const [tone, [root, icon, title, dismiss]] of Object.entries(alert)) {
      await sameColours(page.locator(`[role="${tone === 'destructive' ? 'alert' : 'status'}"][data-tone="${tone}"]`), [
        ['', root],
        [':scope > svg', icon],
        ['[id$="-title"]', title],
        ['button', dismiss],
      ]);
    }
    for (const [tone, [indicator, value]] of Object.entries(progress)) {
      const root = page.locator(`[role="progressbar"][data-tone="${tone}"]`);
      await sameColours(root, [
        ['[style*="width"]', indicator],
        ['[class*="tabular-nums"]', value],
      ]);
    }
    await sameColours(page.locator('span[data-tone="success"]').first(), [
      ['', 'bg-success/15 text-success-chip-text'],
    ]);
    for (const tone of ['purple', 'failed']) {
      const unsupported = page.locator(`span[data-tone="${tone}"]`);
      await expect(unsupported).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      expect(
        await unsupported.evaluate((element) =>
          ['--tone', '--tone-text', '--tone-chip-text'].map((name) =>
            getComputedStyle(element).getPropertyValue(name).trim(),
          ),
        ),
      ).toEqual(['', '', '']);
      await unsupported.evaluate((element) => document.body.append(element));
      await expect(unsupported).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    }
  });
}
