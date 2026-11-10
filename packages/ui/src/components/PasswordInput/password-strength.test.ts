import { checkPasswordRules } from './password-strength';

describe('checkPasswordRules', () => {
  it('reports a too short password', () => {
    expect(checkPasswordRules('abc', { minLength: 12 })).toEqual({ met: 0, total: 1, failed: ['minLength'] });
  });

  it('checks each built-in rule', () => {
    expect(checkPasswordRules('abcdefghijkl', { minLength: 12 })).toEqual({ met: 1, total: 1, failed: [] });
    expect(checkPasswordRules('ABC', { lowercase: true }).failed).toEqual(['lowercase']);
    expect(checkPasswordRules('abc', { lowercase: true }).failed).toEqual([]);
    expect(checkPasswordRules('abc', { uppercase: true }).failed).toEqual(['uppercase']);
    expect(checkPasswordRules('aBc', { uppercase: true }).failed).toEqual([]);
    expect(checkPasswordRules('abc', { number: true }).failed).toEqual(['number']);
    expect(checkPasswordRules('ab3', { number: true }).failed).toEqual([]);
    expect(checkPasswordRules('abc1', { symbol: true }).failed).toEqual(['symbol']);
    expect(checkPasswordRules('abc-', { symbol: true }).failed).toEqual([]);
  });

  it('ignores disabled rules and counts only the enabled ones', () => {
    expect(checkPasswordRules('abc', { minLength: 0, number: false, lowercase: true })).toEqual({
      met: 1,
      total: 1,
      failed: [],
    });
  });

  it('puts custom requirements after the built-in rules and reports their own ids', () => {
    const result = checkPasswordRules('abc', { number: true, minLength: 2 }, [
      { id: 'noAbc', label: 'No abc', test: (p) => !p.includes('abc') },
      { id: 'short', label: 'Short', test: (p) => p.length < 5 },
    ]);
    expect(result).toEqual({ met: 2, total: 4, failed: ['number', 'noAbc'] });
  });

  it('fails every rule for the empty password', () => {
    expect(checkPasswordRules('', { minLength: 8, number: true })).toEqual({
      met: 0,
      total: 2,
      failed: ['minLength', 'number'],
    });
  });
});
