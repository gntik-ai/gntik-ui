// Refresh the committed, self-hosted assets from the installed Fontsource package.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = new URL('.', import.meta.resolve('@fontsource-variable/inter/wght.css'));
const output = process.argv[2] ?? fileURLToPath(new URL('../fonts/', import.meta.url));
const css = readFileSync(new URL('wght.css', source), 'utf8').replaceAll("'Inter Variable'", "'Inter'");
mkdirSync(join(output, 'files'), { recursive: true });
for (const [, file] of css.matchAll(/url\(\.\/files\/(inter-[\w-]+-wght-normal\.woff2)\)/g)) {
  copyFileSync(new URL('files/' + file, source), join(output, 'files', file));
}
writeFileSync(join(output, 'inter.css'), css);
copyFileSync(new URL('LICENSE', source), join(output, 'OFL.txt'));
