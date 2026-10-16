import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadIndex } from '../dist/indexer.js';
import { buildServer } from '../dist/server.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const index = loadIndex(root, { source: 'dir' });
const client = new Client({ name: 'validate-test', version: '0.0.0' });
const textOf = (result) => result.content.map((c) => c.text ?? '').join('\n');

before(async () => {
  const server = buildServer({
    getIndex: () => index,
    sync: async () => ({ root, source: 'dir', stats: index.stats }),
  });
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
});
after(() => client.close());

test('validate_page publica y respeta extendedColorChecks', async () => {
  const { tools } = await client.listTools();
  const schema = tools.find((tool) => tool.name === 'validate_page').inputSchema;
  assert.equal(schema.properties.extendedColorChecks.type, 'boolean');
  assert.ok(!schema.required.includes('extendedColorChecks'));

  for (const extendedColorChecks of [undefined, true, false]) {
    const result = await client.callTool({
      name: 'validate_page',
      arguments: {
        source: '\n<div className="bg-black border-x-[color:red]" />',
        filename: 'Page.tsx',
        ...(extendedColorChecks === undefined ? {} : { extendedColorChecks }),
      },
    });
    assert.ok(!result.isError);
    const output = textOf(result);
    assert.match(output, /# Validation · Page\.tsx/);
    if (extendedColorChecks === false) {
      assert.match(output, /✅ \*\*No errors\*\*/);
      assert.doesNotMatch(output, /\*\*(palette-class|arbitrary-color)\*\*/);
    } else {
      assert.match(output, /L2 · \*\*palette-class\*\* \(error\)/);
      assert.match(output, /L2 · \*\*arbitrary-color\*\* \(error\)/);
      assert.ok(output.includes('bg-black'));
      assert.ok(output.includes('border-x-[color:red]'));
    }
  }
});

test('get_rules describe colores ampliados y la opción de compatibilidad', async () => {
  const output = textOf(await client.callTool({ name: 'get_rules', arguments: {} }));
  assert.match(output, /Tailwind palette class/);
  assert.match(output, /Arbitrary colour in Tailwind colour utilities/);
  for (const coverage of [
    'bg-white',
    'text-black',
    'CSS Color 4',
    'hwb',
    'color:',
    'ring-offset',
    'extendedColorChecks',
  ]) {
    assert.ok(output.includes(coverage), coverage);
  }
});
