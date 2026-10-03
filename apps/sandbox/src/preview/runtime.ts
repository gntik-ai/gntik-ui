// Compiles one TSX file with sucrase and evaluates it against the already-loaded kit modules.
import { transform } from 'sucrase';
import type { ComponentType } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ui from '@gntik-ai/ui';
import * as blocks from '@gntik-ai/blocks';
import * as templates from '@gntik-ai/templates';
import * as charts from '@gntik-ai/charts';
import * as icons from '@gntik-ai/icons';
import * as chat from '@gntik-ai/chat';
import * as flow from '@gntik-ai/flow';
import type { SandboxError } from '../protocol';

/** CommonJS view of an ES namespace, so sucrase's interop helpers treat it as an ES module. */
function asCommonJs(ns: object): Record<string, unknown> {
  const mod: Record<string, unknown> = { ...ns, __esModule: true };
  if (!('default' in ns)) mod.default = ns;
  return mod;
}

/** Module names user code may import. Anything else throws a readable error. */
export const MODULES: Readonly<Record<string, Record<string, unknown>>> = {
  react: asCommonJs(React),
  'react-dom': asCommonJs(ReactDOM),
  'react/jsx-runtime': asCommonJs(jsxRuntime),
  '@gntik-ai/ui': asCommonJs(ui),
  '@gntik-ai/blocks': asCommonJs(blocks),
  '@gntik-ai/templates': asCommonJs(templates),
  '@gntik-ai/charts': asCommonJs(charts),
  '@gntik-ai/icons': asCommonJs(icons),
  '@gntik-ai/chat': asCommonJs(chat),
  '@gntik-ai/flow': asCommonJs(flow),
};

export class SandboxFailure extends Error {
  constructor(readonly detail: SandboxError) {
    super(detail.message);
  }
}

function sandboxRequire(name: string): unknown {
  // CSS imports from pasted kit snippets are already applied by the preview page.
  if (name.endsWith('.css')) return {};
  const mod = MODULES[name];
  if (!mod) throw new Error(`Cannot import "${name}". The sandbox provides: ${Object.keys(MODULES).join(', ')}.`);
  return mod;
}

function errorText(e: unknown): { message: string; details?: string } {
  if (e instanceof Error) return { message: e.message, details: e.stack };
  return { message: String(e) };
}

/** TSX → CommonJS (types stripped, automatic JSX runtime). Throws SandboxFailure('compile'). */
export function compile(code: string): string {
  try {
    return transform(code, {
      transforms: ['typescript', 'jsx', 'imports'],
      jsxRuntime: 'automatic',
      production: true,
      filePath: 'App.tsx',
    }).code;
  } catch (e) {
    throw new SandboxFailure({ kind: 'compile', ...errorText(e) });
  }
}

/** Runs compiled code and returns its default export. Throws SandboxFailure('runtime'). */
export function evaluate(compiled: string): ComponentType {
  const module: { exports: Record<string, unknown> } = { exports: {} };
  try {
    // The sandbox exists to run code the user typed, in its own frame.
    const run = new Function('require', 'module', 'exports', compiled) as (r: typeof sandboxRequire, m: typeof module, e: Record<string, unknown>) => void;
    run(sandboxRequire, module, module.exports);
  } catch (e) {
    throw new SandboxFailure({ kind: 'runtime', ...errorText(e) });
  }
  const component = module.exports.default;
  if (typeof component !== 'function' && !(typeof component === 'object' && component !== null && '$$typeof' in component)) {
    throw new SandboxFailure({
      kind: 'runtime',
      message: 'The file has no default export to render. Add `export default function App() { … }`.',
    });
  }
  return component as ComponentType;
}

/** compile + evaluate. */
export function build(code: string): ComponentType {
  return evaluate(compile(code));
}

export function toSandboxError(e: unknown, kind: SandboxError['kind'] = 'runtime'): SandboxError {
  if (e instanceof SandboxFailure) return e.detail;
  return { kind, ...errorText(e) };
}
