import { writeFile } from 'node:fs/promises';
import { themeScript } from '../dist/theme-script.js';

// A classic script generated from the server-safe entry, without bundler banners.
await writeFile(new URL('../dist/theme-bootstrap.js', import.meta.url), themeScript() + '\n');
