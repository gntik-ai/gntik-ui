import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { loadIndex } from '../dist/indexer.js';
import { buildServer } from '../dist/server.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

test('SidebarLayout keeps its application shell as the canonical kit usage', async () => {
  const index = loadIndex(root, { source: 'dir' });
  const server = buildServer({
    getIndex: () => index,
    sync: async () => ({ root, source: 'dir', stats: index.stats }),
  });
  const client = new Client({ name: 'sidebar-usage-test', version: '0.0.0' });
  const [serverTransport, clientTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const result = await client.callTool({
      name: 'get_component',
      arguments: { id: 'sidebar-layout', include_source: false },
    });
    const documentation = result.content.map((content) => content.text ?? '').join('\n');
    const usage = /```tsx\n([\s\S]*?)\n```/.exec(documentation)?.[1];
    assert.ok(usage, 'kit tool returns a usage example');
    for (const component of ['NavList', 'WorkspaceSwitcher', 'DemoTopbar']) {
      assert.ok(usage.includes(`<${component}`), `usage demonstrates ${component}`);
    }
  } finally {
    await client.close();
  }
});

test('published SidebarLayout documentation keeps the application shell usage', () => {
  const documentation = fs.readFileSync(new URL('../../../apps/docs/public/llms-full.txt', import.meta.url), 'utf8');
  const section = documentation.split('\n### SidebarLayout (`sidebar-layout`)')[1]?.split('\n### ')[0];
  assert.ok(section, 'SidebarLayout is documented');
  for (const component of ['NavList', 'WorkspaceSwitcher', 'DemoTopbar']) {
    assert.ok(section.includes(`<${component}`), `published usage demonstrates ${component}`);
  }
});
