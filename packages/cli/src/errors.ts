/** Machine-readable error codes and the exit code each one maps to. */
export const EXIT_CODES = {
  OK: 0,
  ERROR: 1,
  REGISTRY: 1,
  INSTALL: 1,
  CODEMODS: 1,
  USAGE: 2,
  NOT_FOUND: 3,
  CONFLICT: 4,
} as const;

export type ErrorCode = Exclude<keyof typeof EXIT_CODES, 'OK'>;

export class CliError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message);
  }

  get exitCode(): number {
    return EXIT_CODES[this.code];
  }
}
