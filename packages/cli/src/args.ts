import { parseArgs } from 'node:util';
import { CliError } from './errors.js';

export const COMMANDS = ['init', 'add', 'eject', 'list', 'search', 'docs'] as const;
export type CommandName = (typeof COMMANDS)[number];

export interface Flags {
  json: boolean;
  cwd?: string;
  registry?: string;
  dryRun: boolean;
  yes: boolean;
  overwrite: boolean;
  install: boolean;
  deps: boolean;
  kind?: string;
  group?: string;
  brand?: string;
  limit?: number;
  help: boolean;
  version: boolean;
}

export interface ParsedArgs {
  command?: CommandName;
  positionals: string[];
  flags: Flags;
}

const OPTIONS = {
  json: { type: 'boolean' },
  cwd: { type: 'string' },
  registry: { type: 'string', short: 'r' },
  'dry-run': { type: 'boolean' },
  yes: { type: 'boolean', short: 'y' },
  overwrite: { type: 'boolean' },
  'no-install': { type: 'boolean' },
  'no-deps': { type: 'boolean' },
  kind: { type: 'string', short: 'k' },
  group: { type: 'string', short: 'g' },
  brand: { type: 'string' },
  limit: { type: 'string' },
  help: { type: 'boolean', short: 'h' },
  version: { type: 'boolean', short: 'v' },
} as const;

/** Flags each command accepts on top of the global ones (--json --cwd --registry --help --yes). */
const COMMAND_FLAGS: Record<CommandName, string[]> = {
  init: ['dry-run', 'overwrite', 'no-install', 'brand'],
  add: ['dry-run', 'overwrite', 'no-install'],
  eject: ['dry-run', 'overwrite', 'no-install', 'no-deps'],
  list: ['kind', 'group'],
  search: ['kind', 'limit'],
  docs: [],
};
const GLOBAL_FLAGS = ['json', 'cwd', 'registry', 'help', 'version', 'yes'];

export function parseCliArgs(argv: string[]): ParsedArgs {
  let parsed;
  try {
    parsed = parseArgs({ args: argv, options: OPTIONS, allowPositionals: true, strict: true });
  } catch (e) {
    throw new CliError('USAGE', (e as Error).message);
  }
  const { values, positionals } = parsed;
  const [first, ...rest] = positionals;
  let command: CommandName | undefined;
  if (first !== undefined) {
    if (!(COMMANDS as readonly string[]).includes(first)) throw new CliError('USAGE', `Unknown command "${first}". Run gntik-ui --help.`);
    command = first as CommandName;
    const allowed = new Set([...GLOBAL_FLAGS, ...COMMAND_FLAGS[command]]);
    for (const key of Object.keys(values)) {
      if (!allowed.has(key)) throw new CliError('USAGE', `Option --${key} is not valid for "${command}".`);
    }
  }
  let limit: number | undefined;
  if (values.limit !== undefined) {
    limit = Number(values.limit);
    if (!Number.isInteger(limit) || limit < 1) throw new CliError('USAGE', '--limit must be a positive integer');
  }
  return {
    command,
    positionals: command ? rest : positionals,
    flags: {
      json: values.json ?? false,
      cwd: values.cwd,
      registry: values.registry,
      dryRun: values['dry-run'] ?? false,
      yes: values.yes ?? false,
      overwrite: values.overwrite ?? false,
      install: !values['no-install'],
      deps: !values['no-deps'],
      kind: values.kind,
      group: values.group,
      brand: values.brand,
      limit,
      help: values.help ?? false,
      version: values.version ?? false,
    },
  };
}
