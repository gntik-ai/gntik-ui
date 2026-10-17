import { expect, test } from '@playwright/test';
import { normalizeSelectListboxNames, selectListboxPairs, surfaces } from './block-labels.helpers.js';

const html =
  '<main><span id="label">Filas por página</span><button role="combobox" aria-haspopup="listbox" aria-expanded="true" aria-controls="rows" aria-labelledby="label" aria-label="Ignored">10</button><div id="rows" role="listbox" aria-label="Filas por página"><div role="option">10</div></div></main>';

test('pairs by exact aria-controls and reads the computed trigger name', async ({ page }) => {
  await page.setContent(html);
  const pairs = await selectListboxPairs(page);
  expect(pairs).toHaveLength(1);
  expect(pairs[0]).toMatchObject({ listboxId: 'rows', name: 'Filas por página' });
  const current = await surfaces(page);
  const normalized = normalizeSelectListboxNames(current, pairs);
  expect(current.tree).toBe(
    '- main:\n  - text: Filas por página\n  - combobox "Filas por página" [expanded]: "10"\n  - listbox "Filas por página":\n    - option "10"',
  );
  expect(normalized.tree).toBe(
    '- main:\n  - text: Filas por página\n  - combobox "Filas por página" [expanded]: "10"\n  - listbox:\n    - option "10"',
  );
});

test('an unnamed paired listbox fails the independent name assertion', async ({ page }) => {
  test.setTimeout(300_000);
  await page.setContent(html);
  await page.getByRole('listbox').evaluate((node) => node.removeAttribute('aria-label'));
  await expect(selectListboxPairs(page)).rejects.toThrow();
});

test('hidden and unpaired listboxes leave every surface unchanged', async ({ page }) => {
  await page.setContent(html);
  await page.getByRole('combobox').evaluate((node) => node.setAttribute('aria-controls', 'rows-extra'));
  let pairs = await selectListboxPairs(page);
  expect(pairs).toEqual([]);
  const current = await surfaces(page);
  expect(normalizeSelectListboxNames(current, pairs)).toEqual(current);
  await page.getByRole('listbox').evaluate((node) => {
    node.hidden = true;
  });
  pairs = await selectListboxPairs(page);
  expect(pairs).toEqual([]);
});
