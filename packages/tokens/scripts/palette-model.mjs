import { PALETTES } from '../src/palettes.js';

/** The two leaf declaration blocks in a palette are light, then dark. */
export function parsePalette(css) {
  return [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, selector]) => !selector.trim().startsWith('@'))
    .map(([, , body]) =>
      Object.fromEntries([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, key, value]) => [key, value.trim()])),
    );
}

/** Read the canonical palette CSS without making the scope renderer depend on disk. */
export function readPalettes(read) {
  return Object.fromEntries(
    PALETTES.filter((id) => id !== 'green').map((id) => [id, parsePalette(read(`palettes/${id}.css`))]),
  );
}
