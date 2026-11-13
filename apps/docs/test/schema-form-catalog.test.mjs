import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { loadKit, usageOf } from '../../../packages/mcp/dist/kit.js';

const root = path.resolve(import.meta.dirname, '../../..');
test('the schema form registry example imports the optional forms entry', () => {
  const item = loadKit(root).byId.get('schema-form');
  assert.ok(item, 'SchemaForm is installable');
  const usage = usageOf(root, item);
  assert.match(usage.code, /import \{ SchemaForm, toValueProps, type SchemaWidget \} from '@gntik-ai\/ui\/forms'/);
  assert.match(usage.code, /import \{ Input \} from '@gntik-ai\/ui'/);
  const full = fs.readFileSync(path.join(root, 'apps/docs/public/llms-full.txt'), 'utf8');
  assert.ok(full.includes(usage.code.trimEnd()), 'llms-full.txt carries the same usable example');
});
