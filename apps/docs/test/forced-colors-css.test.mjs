import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compile } from 'tailwindcss';

// Exercise Tailwind's public compiler: a valid class string alone does not prove
// that arbitrary system colours produce background-color rather than an image.
test('forced-colors system colours compile to media-scoped colour declarations', async () => {
  for (const [utility, property, colour] of [
    ['bg', 'background-color', 'Highlight'],
    ['bg', 'background-color', 'HighlightText'],
    ['bg', 'background-color', 'Canvas'],
    ['bg', 'background-color', 'ButtonText'],
    ['bg', 'background-color', 'CanvasText'],
    ['bg', 'background-color', 'GrayText'],
    ['text', 'color', 'HighlightText'],
    ['border', 'border-color', 'Highlight'],
    ['border', 'border-color', 'Canvas'],
    ['outline', 'outline-color', 'ButtonBorder'],
    ['outline', 'outline-color', 'CanvasText'],
  ]) {
    const compiler = await compile('@tailwind utilities;');
    const css = compiler.build([`forced-colors:${utility}-[${colour}]`]);
    assert.match(css, /@media \(forced-colors: active\)/);
    assert.ok(css.includes(`${property}: ${colour};`), `${utility}-[${colour}] must emit ${property}`);
    assert.ok(!css.includes(`background-image: ${colour}`));
  }
});
