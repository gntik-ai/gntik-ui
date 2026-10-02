// Serves Monaco's AMD build from the docs origin (public/monaco/vs) instead of
// a third-party CDN, so the catalog works offline and in visual tests.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'node_modules', 'monaco-editor', 'min', 'vs');
const dest = path.join(root, 'public', 'monaco', 'vs');
fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true, dereference: true });
