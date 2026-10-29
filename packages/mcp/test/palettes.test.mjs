import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadIndex } from '../dist/indexer.js';
import { buildServer } from '../dist/server.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const index = loadIndex(root, { source: 'dir' });
const client = new Client({ name: 'palette-test', version: '0.0.0' });
const call = async (name, args = {}) => {
  const result = await client.callTool({ name, arguments: args });
  assert.ok(!result.isError);
  return result.content.map((c) => c.text ?? '').join('\n');
};
before(async () => {
  const server = buildServer({
    getIndex: () => index,
    sync: async () => ({ root, source: 'dir', stats: index.stats }),
  });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
});
after(() => client.close());

test('get_tokens lists palettes and returns the requested navy theme values', async () => {
  const output = await call('get_tokens', { format: 'json', palette: 'navy', theme: 'dark' });
  const data = JSON.parse(/```json\n([\s\S]+)\n```/.exec(output)[1]);
  assert.deepEqual(data.palettes, ['green', 'navy']);
  assert.equal(data.themes[0].tokens.primary, '221 90% 78%');
  assert.equal(data.themes[0].palette, 'navy');
  assert.match(await call('get_tokens', { palette: 'navy' }), /--primary:\s*223 54% 23%/);
});

test('get_rules and scaffold_preset explain named palettes without the former single-green rule', async () => {
  const rules = await call('get_rules');
  assert.match(rules, /green.*default.*navy/i);
  assert.match(rules, /high contrast.*shared/i);
  assert.doesNotMatch(rules, /Mono-brand|único color de marca|only brand colour/);
  const preset = await call('scaffold_preset', { name: 'Acme' });
  assert.match(preset, /palette/);
  assert.doesNotMatch(preset, /Colours never change between presets/);
});
