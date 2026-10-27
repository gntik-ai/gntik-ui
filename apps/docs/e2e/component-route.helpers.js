import fs from 'node:fs';
import { expect } from '@playwright/test';
const items = JSON.parse(fs.readFileSync(new URL('../../../kit-registry.json', import.meta.url))).items;
export const componentItems = items.filter((i) => i.kind === 'component' && i.package === '@gntik-ai/ui' && i.docs);
export async function openComponent(page, folder) {
  const item = componentItems.find((i) => i.docs.endsWith(`/${folder}.doc.ts`));
  if (!item) throw new Error(`No component route for ${folder}`);
  await page.waitForFunction(() => typeof window.__goto === 'function');
  await page.evaluate((id) => window.__goto('ui-components', id), item.id);
  await expect(page.locator('main h1')).toHaveText(item.name);
}
