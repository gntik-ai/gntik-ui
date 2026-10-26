import { test, expect } from '@playwright/test';

const outline = (locator) =>
  locator.evaluate((element) => {
    const css = getComputedStyle(element);
    return [css.outlineStyle, css.outlineWidth, css.outlineColor, css.outlineOffset];
  });

for (const theme of ['dark', 'light', 'high_contrast']) {
  test(`focus utilities match the legacy outline and stay inside clipped rows / ${theme}`, async ({ page }) => {
    await page.goto(`/preview.html?kind=block&id=focus-rings&theme=${theme}`);
    const start = page.getByRole('button', { name: 'Start focus preview', exact: true });
    const regular = page.getByRole('button', { name: 'Outside outline', exact: true });
    const inset = page.getByRole('button', { name: 'Inside outline', exact: true });
    const scoped = page.getByRole('button', { name: 'Scoped outline', exact: true });
    // Compare the real emitted legacy classes, rather than recreating their CSS.
    for (const button of [regular, scoped]) {
      await button.evaluate((element) => {
        const legacy = element.cloneNode(true);
        legacy.textContent = `Legacy ${element.textContent.trim()}`;
        legacy.classList.remove('focus-ring');
        legacy.classList.add(
          'focus-visible:outline-2',
          'focus-visible:outline-offset-2',
          'focus-visible:outline-focus-ring',
        );
        element.after(legacy);
      });
    }
    const legacy = page.getByRole('button', { name: 'Legacy Outside outline', exact: true });
    const scopedLegacy = page.getByRole('button', { name: 'Legacy Scoped outline', exact: true });
    await start.click();
    await page.keyboard.press('Tab');
    await expect(regular).toBeFocused();
    const normal = await outline(regular);
    expect(normal[0]).toBe('solid');
    expect(normal[1]).toBe('2px');
    expect(normal[3]).toBe('2px');
    await page.keyboard.press('Tab');
    await expect(legacy).toBeFocused();
    expect(await outline(legacy)).toEqual(normal);
    await page.keyboard.press('Tab');
    await expect(inset).toBeFocused();
    const inside = await outline(inset);
    expect(inside).toEqual([normal[0], normal[1], normal[2], '-2px']);
    const geometry = await inset.evaluate((element) => {
      const row = element.getBoundingClientRect();
      const list = element.closest('ul').getBoundingClientRect();
      const css = getComputedStyle(element);
      const reach = parseFloat(css.outlineWidth) + parseFloat(css.outlineOffset);
      return {
        reach,
        insideClip:
          row.left - reach >= list.left &&
          row.right + reach <= list.right &&
          row.top - reach >= list.top &&
          row.bottom + reach <= list.bottom,
      };
    });
    expect(geometry).toEqual({ reach: 0, insideClip: true });
    await page.keyboard.press('Tab');
    await expect(scoped).toBeFocused();
    const scopedOutline = await outline(scoped);
    await page.keyboard.press('Tab');
    await expect(scopedLegacy).toBeFocused();
    expect(await outline(scopedLegacy)).toEqual(scopedOutline);
    for (const button of [regular, legacy, inset, scoped, scopedLegacy]) {
      await button.evaluate((element) => element.blur());
      await button.click();
      await expect(button).toBeFocused();
      await expect(button).toHaveCSS('outline-style', 'none');
    }
  });
}
