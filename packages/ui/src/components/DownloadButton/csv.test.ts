import { escapeCsvCell, toCsv } from './csv';

describe('toCsv', () => {
  it('writes headers and RFC 4180 text cells with CRLF rows', () => {
    expect(
      toCsv(
        [
          { name: 'Ana López' },
          { name: 'a,b' },
          { name: 'say "hi"' },
          { name: 'line1\nline2' },
          { name: 'line1\rline2' },
        ],
        [{ header: 'Name', value: 'name' }],
      ),
    ).toBe('Name\r\nAna López\r\n"a,b"\r\n"say ""hi"""\r\n"line1\nline2"\r\n"line1\rline2"');
  });
});

// Mirrors packages/templates/src/audit-log/Page.test.tsx without reversing the package dependency.
const auditFormulaCases = [
  [
    'formula with quotes and comma',
    '=HYPERLINK("https://example.test","x")',
    `"'=HYPERLINK(""https://example.test"",""x"")"`,
  ],
  ['equals', '=1+1', "'=1+1"],
  ['plus', '+1', "'+1"],
  ['minus', '-1', "'-1"],
  ['at sign', '@SUM(A1)', "'@SUM(A1)"],
  ['tab', '\tprojects/a', "'\tprojects/a"],
  // Deliberate divergence: CR triggers both formula escaping and RFC 4180 quoting.
  ['carriage return', '\rprojects/a', `"'\rprojects/a"`],
  ['plain', 'projects/a', 'projects/a'],
  ['comma', 'projects/a,b', '"projects/a,b"'],
  ['quote', 'projects/"a"', '"projects/""a"""'],
  ['newline', 'projects/a\nb', '"projects/a\nb"'],
  ['embedded equals', 'a=b', 'a=b'],
  ['embedded minus', 'x-1', 'x-1'],
  ['leading space', ' =1+1', ' =1+1'],
  ['empty', '', ''],
] as const;

describe('spreadsheet formula protection', () => {
  it.each(auditFormulaCases)('escapes %s before quoting, in both public helpers', (_, input, expected) => {
    expect(escapeCsvCell(input)).toBe(expected);
    expect(toCsv([{ cell: input }], [{ header: 'Cell', value: 'cell' }])).toBe(`Cell\r\n${expected}`);
  });
  it('escapes formulas in headers too', () => {
    expect(toCsv([], [{ header: '=1+1', value: 'cell' }])).toBe("'=1+1");
  });
  it('maps typed values without turning negative numbers into text', () => {
    const values = [null, undefined, new Date('2026-10-01T08:00:00Z'), -1, true, false, { tier: 'pro' }];
    expect(toCsv(values, [{ header: 'Value', value: (value) => value }])).toBe(
      'Value\r\n\r\n\r\n2026-10-01T08:00:00.000Z\r\n-1\r\ntrue\r\nfalse\r\n"{""tier"":""pro""}"',
    );
  });
});

describe('CSV options', () => {
  const columns = [{ header: 'Cell', value: 'cell' }] as const;
  it('supports LF, omitted headers and a UTF-8 BOM', () => {
    expect(toCsv([{ cell: 'a' }, { cell: 'b' }], columns, { lineEnding: '\n', bom: true, header: false })).toBe(
      '\uFEFFa\nb',
    );
    expect(toCsv([], columns, { header: false })).toBe('');
    expect(toCsv([], columns)).toBe('Cell');
  });
  it.each([
    [';', '"a;b";a,b;"say ""hi"""'],
    ['\t', 'a;b\ta,b\t"say ""hi"""'],
  ] as const)('uses %j to quote and separate cells', (delimiter, expected) => {
    expect(
      toCsv(
        [['a;b', 'a,b', 'say "hi"']],
        [
          { header: 'One', value: 0 },
          { header: 'Two', value: 1 },
          { header: 'Three', value: 2 },
        ],
        { delimiter, header: false },
      ),
    ).toBe(expected);
    expect(escapeCsvCell(`a${delimiter}b`, delimiter)).toBe(`"a${delimiter}b"`);
  });
  it('quotes tabs when they are delimiters after escaping the formula trigger', () => {
    expect(toCsv([{ cell: '\tx' }], columns, { delimiter: '\t', header: false })).toBe(`"'\tx"`);
  });
  it.each(['=1+1', '+1', '-x', '@x', '\tx', '\rx'])(
    'allows machine consumers to opt out of formula escaping: %j',
    (cell) => {
      expect(toCsv([{ cell }], columns, { escapeFormulas: false, header: false })).toBe(
        cell === '\rx' ? '"\rx"' : cell,
      );
      expect(toCsv([], [{ header: cell, value: 'cell' }], { escapeFormulas: false })).toBe(
        cell === '\rx' ? '"\rx"' : cell,
      );
    },
  );
});
