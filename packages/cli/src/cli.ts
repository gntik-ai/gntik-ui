import path from 'node:path';
import pkg from '../package.json' with { type: 'json' };
import { parseCliArgs, type CommandName } from './args.js';
import { add } from './commands/add.js';
import { eject } from './commands/eject.js';
import { init } from './commands/init.js';
import { docs, list, search } from './commands/query.js';
import { defaultExec, type CommandResult, type Context, type Exec } from './context.js';
import { CliError } from './errors.js';
import { HELP } from './help.js';

export const VERSION: string = pkg.version;

export interface RunOptions {
  cwd?: string;
  env?: Record<string, string | undefined>;
  exec?: Exec;
  stdout?: (s: string) => void;
  stderr?: (s: string) => void;
}

const HANDLERS: Record<CommandName, (ctx: Context, positionals: string[]) => Promise<CommandResult>> = {
  init: (ctx) => init(ctx),
  add,
  eject,
  list: (ctx) => list(ctx),
  search,
  docs,
};

/** Runs the CLI and returns the exit code. Never calls process.exit. */
export async function run(argv: string[], opts: RunOptions = {}): Promise<number> {
  const stdout = opts.stdout ?? ((s) => process.stdout.write(s));
  const stderr = opts.stderr ?? ((s) => process.stderr.write(s));
  const invocationCwd = opts.cwd ?? process.cwd();
  const wantsJson = argv.includes('--json');
  let command: string | null = null;
  const fail = (err: CliError) => {
    if (wantsJson) stdout(`${JSON.stringify({ ok: false, command, error: { code: err.code, message: err.message } }, null, 2)}\n`);
    else stderr(`gntik-ui: ${err.message}\n`);
    return err.exitCode;
  };
  try {
    const args = parseCliArgs(argv);
    command = args.command ?? null;
    const { flags } = args;
    if (flags.version) {
      stdout(flags.json ? `${JSON.stringify({ ok: true, command: 'version', version: VERSION })}\n` : `${VERSION}\n`);
      return 0;
    }
    if (flags.help || !args.command) {
      if (!flags.help && args.positionals.length) throw new CliError('USAGE', `Unknown command "${args.positionals[0]}"`);
      const help = HELP[args.command ?? 'main'];
      stdout(flags.json ? `${JSON.stringify({ ok: true, command: command ?? 'help', help })}\n` : `${help}\n`);
      return flags.help ? 0 : 2;
    }
    const ctx: Context = {
      cwd: path.resolve(invocationCwd, flags.cwd ?? '.'),
      invocationCwd,
      flags,
      exec: opts.exec ?? defaultExec,
      env: opts.env ?? process.env,
    };
    const result = await HANDLERS[args.command](ctx, args.positionals);
    if (flags.json) {
      const out: Record<string, unknown> = { ok: result.code === 0, command, ...result.data };
      if (result.error) out.error = { code: result.error.code, message: result.error.message };
      stdout(`${JSON.stringify(out, null, 2)}\n`);
    } else {
      if (result.text.length) stdout(`${result.text.join('\n')}\n`);
      if (result.error) stderr(`gntik-ui: ${result.error.message}\n`);
    }
    return result.code;
  } catch (e) {
    if (e instanceof CliError) return fail(e);
    return fail(new CliError('ERROR', (e as Error).message ?? String(e)));
  }
}
