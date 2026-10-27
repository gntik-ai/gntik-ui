import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import pathModule from 'node:path';
import { parseDataAttributes, validateDataAttributes } from '../src/styling-hooks.js';
const root = new URL('../../../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
test('Select state hooks include shared item styles and group prefixes per slot', () => {
  const rows = parseDataAttributes(read('packages/ui/src/components/Select/select.variants.ts'));
  for (const [attribute, part] of [
    ['data-popup-open', 'trigger'],
    ['data-disabled', 'trigger'],
    ['data-highlighted', 'item'],
    ['data-selected', 'item'],
    ['data-disabled', 'item'],
    ['data-popup-open', 'icon'],
  ])
    assert.ok(
      rows.some((r) => r.attribute === attribute && r.part === part),
      `${part}: ${attribute}`,
    );
  assert.deepEqual(parseDataAttributes("export const plain = tv({ slots: { root: 'bg-card text-foreground' } });"), []);
});
test('bracket value and named group modifiers preserve attribute names', () => {
  assert.deepEqual(
    parseDataAttributes(
      "export const styles = tv({slots: { root: 'group-data-[state=open]/menu:block data-[side=top]:mb-2' }});",
    ),
    [
      { attribute: 'data-state', part: 'root' },
      { attribute: 'data-side', part: 'root' },
    ],
  );
});
test('drift validation names the component and missing attribute', () => {
  assert.throws(
    () =>
      validateDataAttributes(
        { name: 'Select', dataAttributes: [['data-expanded', 'trigger', 'Expanded']] },
        'data-popup-open:block',
      ),
    /Select.*data-expanded/,
  );
  assert.doesNotThrow(() => validateDataAttributes({ name: 'Old doc' }, ''));
});
test('every declared UI documentation attribute occurs in real source or variants', async () => {
  const docs = fs
    .readdirSync(new URL('packages/ui/src/', root), { recursive: true })
    .filter((p) => p.endsWith('.doc.ts'));
  for (const path of docs) {
    if (!read(`packages/ui/src/${path}`).includes('dataAttributes:')) continue;
    const { doc } = await import(new URL(`packages/ui/src/${path}`, root));
    const dir = path.slice(0, path.lastIndexOf('/'));
    let code = fs
      .readdirSync(new URL(`packages/ui/src/${dir}/`, root))
      .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.(doc|test)\./.test(f))
      .map((f) => read(`packages/ui/src/${dir}/${f}`))
      .join('\n');
    for (const match of [...code.matchAll(/from ['"]([.][^'"]+)['"]/g)]) {
      const dependency = pathModule.posix.normalize(`packages/ui/src/${dir}/${match[1]}.ts`);
      if (dependency.endsWith('.variants.ts') && fs.existsSync(new URL(dependency, root)))
        code += '\n' + read(dependency);
    }
    validateDataAttributes(doc, code);
  }
});
test('slot overrides in variant options contribute their state hooks', () => {
  assert.deepEqual(
    parseDataAttributes(
      "const invalid = 'data-invalid:border-border'; export const styles = tv({ slots: {trigger: 'bg-card'}, variants: {variant: {filled: {trigger: invalid}}}});",
    ),
    [{ attribute: 'data-invalid', part: 'trigger' }],
  );
});
