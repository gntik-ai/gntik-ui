import fs from 'node:fs';
import { expect } from '@playwright/test';

const registry = JSON.parse(fs.readFileSync(new URL('../../../kit-registry.json', import.meta.url), 'utf8'));
const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const uiRoot = new URL('../../../packages/ui/src/', import.meta.url);
const paths = [
  'forms',
  'hooks',
  'utils',
  'theme',
  'csp',
  ...fs.readdirSync(new URL('components/', uiRoot)).map((f) => `components/${f}`),
];
export const componentPages = paths.flatMap((dir) =>
  fs
    .readdirSync(new URL(`${dir}/`, uiRoot))
    .filter((file) => file.endsWith('.doc.ts'))
    .map((file) => {
      const docPath = `packages/ui/src/${dir}/${file}`;
      const folder = file.replace('.doc.ts', '');
      const source = fs.readFileSync(new URL(`${dir}/${file}`, uiRoot), 'utf8');
      return {
        folder,
        name: /\bname:\s*['"]([^'"]+)/.exec(source)[1],
        id: registry.items.find((i) => i.docs === docPath)?.id ?? kebab(folder),
      };
    }),
);

/** Navigate within the document so injected axe and preview settings survive. */
export async function openComponent(page, folder) {
  const item = componentPages.find((p) => p.folder === folder);
  if (!item) throw new Error(`No documented component ${folder}`);
  await page.evaluate((id) => window.__goto('ui-components', id), item.id);
  await expect(page.locator(`#ui-${folder}`)).toBeVisible();
}
