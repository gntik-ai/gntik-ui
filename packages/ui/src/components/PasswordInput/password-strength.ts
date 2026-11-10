import type { ReactNode } from 'react';

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

const COMMON = new Set([
  'password',
  'password1',
  'passw0rd',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'qwerty123',
  'letmein',
  'welcome',
  'admin',
  'iloveyou',
  'abc123',
  '111111',
  'changeme',
  'secret',
]);

/**
 * Small built-in heuristic (not zxcvbn): length (8+, 12+) and character variety
 * (2+ and 3+ of lower / upper / digit / symbol). Common or single-character passwords score 0.
 */
export function scorePassword(password: string): PasswordStrength {
  if (!password) return 0;
  if (COMMON.has(password.toLowerCase()) || /^(.)\1*$/.test(password)) return 0;
  const classes = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (classes >= 2) score++;
  if (classes >= 3) score++;
  if (password.length < 6) score = Math.min(score, 1);
  return Math.min(score, 4) as PasswordStrength;
}

export const DEFAULT_STRENGTH_LABELS: readonly [string, string, string, string, string] = [
  'Too weak',
  'Weak',
  'Fair',
  'Good',
  'Strong',
];

/** Built-in password rules; a rule that is omitted, 0 or false is not checked. */
export interface PasswordRules {
  minLength?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  number?: boolean;
  symbol?: boolean;
}

export type PasswordRuleId = 'minLength' | 'lowercase' | 'uppercase' | 'number' | 'symbol';

/** A custom rule that follows the built-in ones; `id` is what `checkPasswordRules` reports on failure. */
export interface PasswordRequirement {
  id: string;
  label: ReactNode;
  test: (password: string) => boolean;
}

export interface PasswordRulesResult {
  met: number;
  total: number;
  failed: string[];
}

/** The enabled built-in rules, in display order. Character classes match `scorePassword`. */
export function builtInPasswordRules(
  rules: PasswordRules = {},
): Array<{ id: PasswordRuleId; test: (password: string) => boolean }> {
  const list: Array<{ id: PasswordRuleId; test: (password: string) => boolean }> = [];
  const { minLength } = rules;
  if (minLength) list.push({ id: 'minLength', test: (p) => p.length >= minLength });
  if (rules.lowercase) list.push({ id: 'lowercase', test: (p) => /[a-z]/.test(p) });
  if (rules.uppercase) list.push({ id: 'uppercase', test: (p) => /[A-Z]/.test(p) });
  if (rules.number) list.push({ id: 'number', test: (p) => /\d/.test(p) });
  if (rules.symbol) list.push({ id: 'symbol', test: (p) => /[^A-Za-z0-9]/.test(p) });
  return list;
}

/**
 * Checks a password against the same rules the PasswordInput checklist shows, so a schema can
 * enforce the policy the UI displays. Custom requirements come after the built-in rules.
 */
export function checkPasswordRules(
  password: string,
  rules: PasswordRules = {},
  requirements: readonly PasswordRequirement[] = [],
): PasswordRulesResult {
  const all = [...builtInPasswordRules(rules), ...requirements];
  const failed = all.filter((rule) => !rule.test(password)).map((rule) => rule.id);
  return { met: all.length - failed.length, total: all.length, failed };
}
