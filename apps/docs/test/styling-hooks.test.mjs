import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createServer } from 'vite';

test('styling hooks preserve variant slots and reject undocumented attributes at the public docs boundary', async () => {
  const server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true, ws: false, watch: null },
    optimizeDeps: { noDiscovery: true, include: [] },
  });
  try {
    const { __parse, COMPONENT_API } = await server.ssrLoadModule('/src/api-docs.js');
    const select = readFileSync(
      new URL('../../../packages/ui/src/components/Select/select.variants.ts', import.meta.url),
      'utf8',
    );
    const hooks = __parse.parseDataAttributes(select);
    for (const [attribute, part] of [
      ['data-popup-open', 'trigger'],
      ['data-highlighted', 'item'],
      ['data-selected', 'item'],
      ['data-disabled', 'item'],
    ]) {
      assert.ok(
        hooks.some((row) => row.attribute === attribute && row.part === part),
        `Select ${part} must expose ${attribute}`,
      );
    }
    assert.ok(hooks.some((row) => row.attribute === 'data-popup-open' && row.part === 'icon'));
    assert.deepEqual(__parse.parseDataAttributes("export const plain = tv({ base: 'text-foreground' });"), []);
    assert.throws(
      () =>
        __parse.validateDataAttributes(
          { name: 'Plain', dataAttributes: [['data-expanded', 'root', 'Expanded']] },
          "const root = 'data-disabled:opacity-50'",
        ),
      /Plain.*data-expanded/,
    );
    assert.doesNotThrow(() => __parse.validateDataAttributes({ name: 'OldDoc' }, ''));
    assert.doesNotThrow(() =>
      __parse.validateDataAttributes(
        { name: 'SourceState', dataAttributes: [['data-active', 'root', 'Active']] },
        '<div data-active />',
      ),
    );
    for (const [folder, root] of [
      ...[
        'Select',
        'Combobox',
        'Menu',
        'Dialog',
        'Tabs',
        'Accordion',
        'Popover',
        'Drawer',
        'BottomSheet',
        'Card',
        'Table',
      ].map((name) => [name, name]),
      ['Checkbox', 'CheckboxGroup'],
      ['ChoiceCard', 'SelectableCardGroup'],
      ['Resizable', 'ResizablePanelGroup'],
    ]) {
      assert.ok(COMPONENT_API[folder].anatomy?.includes(`<${root}`), `${folder} anatomy`);
    }
    for (const [folder, api] of Object.entries(COMPONENT_API)) {
      if (api.primitive && api.stylingHooks.length) {
        for (const { attribute, part } of api.stylingHooks) {
          assert.ok(
            api.dataAttributes?.some(([a, p, meaning]) => a === attribute && p === part && meaning.length > 0),
            `${folder} ${part} ${attribute} meaning`,
          );
        }
      }
      const dir = new URL(`../../../packages/ui/src/components/${folder}/`, import.meta.url);
      const source = readdirSync(dir)
        .filter((file) => /\.(ts|tsx)$/.test(file) && !/\.(doc|test)\./.test(file))
        .map((file) => readFileSync(new URL(file, dir), 'utf8'))
        .join('\n');
      assert.doesNotThrow(() => __parse.validateDataAttributes(api, source));
    }
  } finally {
    await server.close();
  }
});
