export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

const COMMON = new Set([
  'password', 'password1', 'passw0rd', '123456', '12345678', '123456789', 'qwerty', 'qwerty123',
  'letmein', 'welcome', 'admin', 'iloveyou', 'abc123', '111111', 'changeme', 'secret',
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

export const DEFAULT_STRENGTH_LABELS: readonly [string, string, string, string, string] = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
