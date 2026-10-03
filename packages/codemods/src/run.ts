import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import jscodeshift from 'jscodeshift';
import { codemods, getCodemod } from './registry.js';
import type { Codemod, CodemodMeta } from './types.js';

export const SOURCE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.mts', '.cts'];
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'build', 'out', 'coverage', '.git', '.next', '.turbo', '.vercel', '.cache']);

export interface CodemodReport {
  transform: string;
  line: number | null;
  message: string;
}

export interface FileResult {
  /** Project-relative, posix separators. */
  file: string;
  status: 'modified' | 'unchanged' | 'error';
  /** Transforms that changed the file. */
  transforms: string[];
  reports: CodemodReport[];
  error?: string;
}

export interface RunOptions {
  /** Project directory (absolute, or relative to process.cwd()). */
  cwd: string;
  /** Transform ids or codemods to run, in order (default: every transform). */
  transforms?: Array<string | Codemod>;
  /** Report what would change without writing (default true). */
  dry?: boolean;
  /** Files or directories to process, relative to cwd (default: the whole project, skipping node_modules, dist, …). */
  files?: string[];
}

export interface RunResult {
  dry: boolean;
  transforms: CodemodMeta[];
  /** Number of source files scanned. */
  scanned: number;
  /** Files that changed (or would), have reports, or failed — sorted by path. */
  files: FileResult[];
  /** Per-file output text for modified files (not written when dry). */
  outputs: Record<string, string>;
}

function parserFor(file: string): 'ts' | 'tsx' {
  return /\.[mc]?ts$/.test(file) ? 'ts' : 'tsx';
}

const isSource = (file: string) => SOURCE_EXTENSIONS.includes(path.extname(file)) && !/\.d\.[mc]?ts$/.test(file);

async function walk(dir: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!IGNORED_DIRS.has(e.name)) await walk(full, out);
    } else if (e.isFile() && isSource(e.name)) out.push(full);
  }
}

/** Source files under cwd (or the given files/dirs), absolute and sorted. */
export async function collectFiles(cwd: string, files?: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const entry of files?.length ? files : ['.']) {
    const full = path.resolve(cwd, entry);
    const info = await stat(full);
    if (info.isDirectory()) await walk(full, out);
    else if (info.isFile()) out.push(full);
  }
  return [...new Set(out)].sort();
}

const REPORT_LINE = /^line (\d+): ([\s\S]*)$/;

/** Applies codemods to one source text. Returns the new text (or the same text) and the reports. */
export function applyCodemods(source: string, filePath: string, list: Codemod[]): { output: string; transforms: string[]; reports: CodemodReport[] } {
  const j = jscodeshift.withParser(parserFor(filePath));
  let output = source;
  const applied: string[] = [];
  const reports: CodemodReport[] = [];
  for (const { meta, transform } of list) {
    const report = (msg: string) => {
      const m = REPORT_LINE.exec(msg);
      reports.push({ transform: meta.id, line: m ? Number(m[1]) : null, message: m ? (m[2] as string) : msg });
    };
    const next = transform({ path: filePath, source: output }, { j, jscodeshift: j, stats: () => {}, report }, {});
    if (typeof next === 'string' && next !== output) {
      output = next;
      applied.push(meta.id);
    }
  }
  return { output, transforms: applied, reports };
}

function resolveCodemods(list: RunOptions['transforms']): Codemod[] {
  if (!list) return [...codemods];
  return list.map((t) => {
    if (typeof t !== 'string') return t;
    const c = getCodemod(t);
    if (!c) throw new Error(`Unknown codemod "${t}"`);
    return c;
  });
}

/** Runs codemods over a project. Dry by default: nothing is written unless `dry: false`. */
export async function runCodemods(options: RunOptions): Promise<RunResult> {
  const cwd = path.resolve(options.cwd);
  const dry = options.dry ?? true;
  const list = resolveCodemods(options.transforms);
  const files = await collectFiles(cwd, options.files);
  const results: FileResult[] = [];
  const outputs: Record<string, string> = {};
  for (const abs of files) {
    const rel = path.relative(cwd, abs).split(path.sep).join('/');
    let source: string;
    try {
      source = await readFile(abs, 'utf8');
      const { output, transforms, reports } = applyCodemods(source, abs, list);
      const modified = output !== source;
      if (modified) {
        outputs[rel] = output;
        if (!dry) await writeFile(abs, output);
      }
      if (modified || reports.length) results.push({ file: rel, status: modified ? 'modified' : 'unchanged', transforms, reports });
    } catch (e) {
      results.push({ file: rel, status: 'error', transforms: [], reports: [], error: (e as Error).message ?? String(e) });
    }
  }
  return { dry, transforms: list.map((c) => c.meta), scanned: files.length, files: results, outputs };
}
