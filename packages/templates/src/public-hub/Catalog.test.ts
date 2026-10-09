import { resolve } from 'node:path';
import process from 'node:process';
import { loadKit, filterKit } from '../../../mcp/src/kit';
import { mdKitItem, mdKitList } from '../../../mcp/src/kit-tools';

// Public seam used by list_kit/get_template: generated catalogue + returned documentation.
it('lists public-hub as an Auth template and returns its composition, props, keyboard and example', () => {
  const root = resolve(process.cwd(), '../..');
  const kit = loadKit(root);
  const templates = filterKit(kit.items, { kind: 'template' });
  const item = templates.find((template) => template.id === 'public-hub');
  expect(item).toBeDefined();
  expect(mdKitList(templates, kit.items.length)).toContain('`public-hub`');
  if (!item) return;
  expect(item.group).toBe('Auth');
  const documentation = mdKitItem(root, item, { source: false });
  expect(documentation).toContain('**Layout:** AuthLayout');
  expect(documentation).toContain('`page-header`');
  expect(documentation).toContain('instead of landing');
  expect(documentation).toContain('**ARIA pattern:**');
  expect(documentation).toContain('## Keyboard');
  expect(documentation).toContain('| Tab / Shift+Tab |');
  expect(documentation).toContain('| Enter |');
  for (const prop of [
    'eyebrow',
    'title',
    'description',
    'cards',
    'primaryAction',
    'secondaryAction',
    'tertiaryLink',
    'footer',
    'loading',
    'logo',
    'loadingLabel',
  ]) {
    expect(documentation).toContain(`| ${prop} |`);
  }
  expect(documentation).toContain('PublicHubPage');
  expect(documentation).toContain('defaultMode="dark"');
});
