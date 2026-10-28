import { matchesAccept, validateFiles } from './accept-files';

describe('file validation', () => {
  it('matches extensions, MIME types, wildcards and arrays without case sensitivity', () => {
    const csv = new File(['data'], 'REPORT.CSV', { type: 'text/csv' });
    expect(matchesAccept(csv, '.csv')).toBe(true);
    expect(matchesAccept(csv, 'TEXT/CSV')).toBe(true);
    expect(matchesAccept(csv, 'text/*')).toBe(true);
    expect(matchesAccept(csv, ['image/*', '.CSV'])).toBe(true);
    expect(matchesAccept(csv, '  ')).toBe(true);
    expect(matchesAccept(csv, [])).toBe(true);
    expect(matchesAccept(csv, '.png,image/*')).toBe(false);
  });

  it('splits a mixed batch and collects all applicable reasons without consuming slots for invalid files', () => {
    const bad = new File(['too big'], 'b.png', { type: 'image/png' });
    const a = new File(['a'], 'a.csv');
    const c = new File(['c'], 'c.csv');
    expect(validateFiles([bad, a, c], { accept: '.csv', maxSize: 5, maxFiles: 1 })).toEqual({
      accepted: [a],
      rejected: [
        { file: bad, reasons: ['type', 'size'] },
        { file: c, reasons: ['count'] },
      ],
    });
    expect(validateFiles([a, bad], { maxFiles: 0, accept: '.csv', maxSize: 5 }).rejected).toEqual([
      { file: a, reasons: ['count'] },
      { file: bad, reasons: ['type', 'size', 'count'] },
    ]);
    expect(validateFiles([a], { maxSize: 1 })).toEqual({ accepted: [a], rejected: [] });
  });
});
