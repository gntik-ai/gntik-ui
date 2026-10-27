import fs from 'node:fs';
import { expect } from '@playwright/test';
import { itemForDoc, componentItemForDoc } from '../src/catalog/routes.js';
const items = JSON.parse(fs.readFileSync(new URL('../../../kit-registry.json', import.meta.url))).items;
const root = new URL('../../../packages/ui/src/', import.meta.url);
const docs = fs
  .readdirSync(root, { recursive: true })
  .filter((p) => p.endsWith('.doc.ts') && !p.startsWith('layouts/'));
export const componentItems = await Promise.all(
  docs.map(async (path) => {
    const registered = itemForDoc(`packages/ui/src/${path}`, items);
    if (registered) return registered;
    const { doc } = await import(new URL(path, root));
    return componentItemForDoc(`packages/ui/src/${path}`, doc, items);
  }),
);
export async function openComponent(page, folder) {
  const item = componentItems.find((i) => i.docs.endsWith(`/${folder}.doc.ts`));
  if (!item) throw new Error(`No component route for ${folder}`);
  await page.waitForFunction(() => typeof window.__goto === 'function');
  await page.evaluate((id) => window.__goto('ui-components', id), item.id);
  await expect(page.locator('main h1')).toHaveText(item.name);
}
