import { test, expect } from '@playwright/test';

// These are real catalog examples using the package components, not DOM replicas.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('gntik-section', 'ui-components'));
  await page.goto('/#ui-components');
  await expect(page.locator('#ui-Switch')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

async function forceColours(page) {
  await page.emulateMedia({ forcedColors: 'active' });
  return page.evaluate(() => {
    const colours = {};
    for (const name of ['Highlight', 'HighlightText', 'Canvas', 'CanvasText', 'ButtonBorder', 'ButtonText']) {
      const probe = document.createElement('span');
      probe.style.backgroundColor = name;
      document.body.append(probe);
      colours[name] = getComputedStyle(probe).backgroundColor;
      probe.remove();
    }
    return colours;
  });
}

async function colour(locator, property, expected) {
  await expect.poll(() => locator.evaluate((el, p) => getComputedStyle(el)[p], property)).toBe(expected);
}

test('switch state, thumb and track geometry survive forced colours', async ({ page }) => {
  const checked = page.locator('#ui-Switch').getByRole('switch', { name: 'Email alerts', exact: true });
  const unchecked = page.locator('#ui-Switch').getByRole('switch', { name: 'Weekly digest', exact: true });
  const sizes = await Promise.all(
    [checked, unchecked].map((el) => el.evaluate((e) => [e.offsetWidth, e.offsetHeight])),
  );
  const c = await forceColours(page);
  await colour(checked, 'backgroundColor', c.Highlight);
  await colour(checked.locator('span').first(), 'backgroundColor', c.HighlightText);
  await colour(unchecked, 'backgroundColor', c.Canvas);
  await colour(unchecked, 'outlineColor', c.ButtonBorder);
  await expect(unchecked).toHaveCSS('outline-width', '1px');
  await expect(unchecked).toHaveCSS('outline-offset', '-1px');
  await colour(unchecked.locator('span').first(), 'backgroundColor', c.ButtonText);
  for (const [index, el] of [checked, unchecked].entries()) {
    expect(await el.evaluate((e) => [e.offsetWidth, e.offsetHeight])).toEqual(sizes[index]);
  }
  await checked.click();
  await colour(checked, 'backgroundColor', c.Canvas);
  await colour(checked.locator('span').first(), 'backgroundColor', c.ButtonText);
});

test('radio circles, dots and checked cards retain their markers', async ({ page }) => {
  const c = await forceColours(page);
  // aria-checked is the public state; the indicator is the visible circle's child.
  const selected = page.locator('#ui-RadioGroup [role="radio"][aria-checked="true"]').first();
  const empty = page.locator('#ui-RadioGroup [role="radio"][aria-checked="false"]:not([data-disabled])').first();
  await colour(selected, 'backgroundColor', c.Highlight);
  await colour(selected.locator('span').first(), 'backgroundColor', c.HighlightText);
  await expect(empty).toHaveCSS('border-top-width', '1px');
  expect(await empty.evaluate((el) => getComputedStyle(el).borderTopColor)).not.toBe(c.Canvas);
  await expect(empty.locator('span')).toHaveCount(0);
  const card = page.locator('#ui-RadioGroup div.rounded-md').filter({ has: selected }).first();
  await expect(card).toHaveCSS('border-top-width', '2px');
  await colour(card, 'borderTopColor', c.Highlight);
});

for (const [name, variant, sliding] of [
  ['Project sections', 'underline', true],
  ['Workspace', 'underline', false],
  ['Time range', 'pills', true],
  ['Report', 'pills', false],
]) {
  test(`${variant} tabs keep only the active marker (indicator=${sliding})`, async ({ page }) => {
    const c = await forceColours(page);
    const list = page.locator('#ui-Tabs').getByRole('tablist', { name, exact: true });
    const tabs = list.getByRole('tab');
    for (const index of [0, 1]) {
      await tabs.nth(index).click();
      await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true');
      const active = list.locator('[role="tab"][aria-selected="true"]');
      if (variant === 'underline') await colour(active, 'borderBottomColor', c.Highlight);
      if (sliding) {
        const marker = list.locator(':scope > span');
        await colour(marker, variant === 'underline' ? 'backgroundColor' : 'borderTopColor', c.Highlight);
        if (variant === 'pills') await expect(marker).toHaveCSS('border-top-width', '2px');
        await expect
          .poll(async () => {
            const a = await active.boundingBox();
            const m = await marker.boundingBox();
            return a && m ? Math.abs(a.x - m.x) : Infinity;
          })
          .toBeLessThan(1);
      } else {
        await colour(active, 'borderBottomColor', c.Highlight);
        await expect(active).toHaveCSS('border-bottom-width', '2px');
      }
      for (const inactive of await list.locator('[role="tab"][aria-selected="false"]').all()) {
        const marker = await inactive.evaluate((el) => {
          const s = getComputedStyle(el);
          return { width: s.borderBottomWidth, colour: s.borderBottomColor };
        });
        if (variant === 'underline') expect(marker.colour).toBe(c.Canvas);
        else expect(marker.width).toBe('0px');
      }
    }
  });
}

test('fills, separators, dots and selection retain system colours', async ({ page }) => {
  const c = await forceColours(page);
  for (const id of ['Progress', 'Meter']) {
    const root = page
      .locator(`#ui-${id}`)
      .getByRole(id === 'Progress' ? 'progressbar' : 'meter')
      .first();
    const fill = root.locator('[class*="forced-colors:bg-"]').first();
    const track = fill.locator('..');
    await colour(fill, 'backgroundColor', c.Highlight);
    await colour(track, 'outlineColor', c.CanvasText);
    await expect(track).toHaveCSS('outline-width', '1px');
    const value = Number(await root.getAttribute('aria-valuenow'));
    const max = Number((await root.getAttribute('aria-valuemax')) || 100);
    await expect
      .poll(async () => {
        const f = await fill.boundingBox();
        const t = await track.boundingBox();
        return f && t ? Math.abs(f.width / t.width - value / max) : Infinity;
      })
      .toBeLessThan(0.01);
  }
  await colour(page.locator('#ui-Separator').getByRole('separator').first(), 'backgroundColor', c.CanvasText);
  await colour(page.locator('#ui-StatusDot [data-tone] > span').first(), 'backgroundColor', c.CanvasText);
  for (const ping of await page.locator('#ui-StatusDot [data-pulse]').all()) await expect(ping).toBeHidden();
  const row = page.locator('#ui-Table tr[data-selected]').first();
  await row.hover();
  await colour(row, 'backgroundColor', c.Highlight);
  await colour(row, 'color', c.HighlightText);
  const select = page.locator('#ui-Select').getByRole('combobox', { name: 'Deployment region', exact: true });
  await select.click();
  await select.press('ArrowDown');
  const option = page.locator('[role="option"][data-highlighted]').first();
  await colour(option, 'backgroundColor', c.Highlight);
  await colour(option, 'color', c.HighlightText);
});
