/** Kit viewport breakpoints in mobile-first order. */
export const BREAKPOINTS = ['base', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

/** A kit viewport breakpoint; base applies below sm. */
export type Breakpoint = (typeof BREAKPOINTS)[number];

/** A scalar or values at selected mobile-first breakpoints. */
export type Responsive<T> = T | Partial<Record<Breakpoint, T>>;

/** Full literal class strings, indexed by breakpoint and String(value), for Tailwind scanning. */
export type ResponsiveClassTable = Record<Breakpoint, Partial<Record<string, string>>>;

/** Whether a value is a non-null breakpoint object rather than a scalar. */
export function isResponsiveObject<T>(value: Responsive<T> | undefined): value is Partial<Record<Breakpoint, T>> {
  return typeof value === 'object' && value !== null;
}

/**
 * Map scalars through base, or defined breakpoint entries in mobile-first order.
 * Unknown breakpoints, undefined values and missing classes are ignored.
 * Tables (and callback results) must contain full literal strings so Tailwind can scan them.
 */
export function responsiveClasses<T extends string | number | boolean>(
  value: Responsive<T> | undefined,
  table: ResponsiveClassTable | ((breakpoint: Breakpoint, value: T) => string | undefined),
): string[] {
  if (value === undefined) return [];
  const values = isResponsiveObject(value) ? value : { base: value };
  return BREAKPOINTS.flatMap((breakpoint) => {
    const entry = values[breakpoint];
    if (entry === undefined) return [];
    const className = typeof table === 'function' ? table(breakpoint, entry) : table[breakpoint][String(entry)];
    return className === undefined ? [] : [className];
  });
}

/**
 * Map continuous values to --name at base and --name-breakpoint elsewhere.
 * Numbers become strings; consuming static classes must implement CSS variable fallbacks.
 */
export function responsiveVars(name: string, value: Responsive<string | number> | undefined): Record<string, string> {
  if (value === undefined) return {};
  const values = isResponsiveObject(value) ? value : { base: value };
  const variables: Record<string, string> = {};
  for (const breakpoint of BREAKPOINTS) {
    const entry = values[breakpoint];
    if (entry !== undefined) variables[breakpoint === 'base' ? `--${name}` : `--${name}-${breakpoint}`] = String(entry);
  }
  return variables;
}

/** Resolve the largest defined breakpoint at or below the target, or return the scalar itself. */
export function resolveResponsive<T>(value: Responsive<T>, breakpoint: Breakpoint): T | undefined {
  if (!isResponsiveObject(value)) return value;
  for (let index = BREAKPOINTS.indexOf(breakpoint); index >= 0; index--) {
    const key = BREAKPOINTS[index];
    if (key !== undefined && value[key] !== undefined) return value[key];
  }
  return undefined;
}
