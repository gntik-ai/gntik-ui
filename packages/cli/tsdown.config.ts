import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  platform: 'node',
  dts: false,
  clean: true,
  // package.json is type: module and its bin points at dist/index.js.
  fixedExtension: false,
  banner: { js: '#!/usr/bin/env node' },
});
