import { foldText, matchRanges, matchText } from './match-text';

it.each([
  ['Función', 'funcion'],
  ['Niño', 'nino'],
  ['Łódź', 'lodz'],
  ['Øresund', 'oresund'],
  ['straße', 'strasse'],
  ['Æsir Œuvre Đ', 'aesir oeuvre d'],
  ['co\u0301digo', 'codigo'],
])('folds %s to %s', (text, folded) => {
  expect(foldText(text)).toBe(folded);
  expect(matchText(text, folded)).toBe(true);
});

it('matches case, trimmed queries and the three modes', () => {
  expect(matchText('función de prueba', ' FUNCION ')).toBe(true);
  expect(matchText('Función', 'funciones')).toBe(false);
  expect(matchText('Función', '')).toBe(true);
  expect(matchText('Función', '  ')).toBe(true);
  expect(matchText('Función', 'func', { mode: 'startsWith' })).toBe(true);
  expect(matchText('Función', 'cion', { mode: 'startsWith' })).toBe(false);
  expect(matchText('Función', 'cion', { mode: 'endsWith' })).toBe(true);
  expect(foldText('Iİ', 'tr')).toBe('ii');
});

it('returns non-overlapping UTF-16 offsets into the original text', () => {
  expect(matchRanges('İstanbul', 'stan')).toEqual([[1, 5]]);
  expect(matchRanges('Función de función', 'FUNCION')).toEqual([
    [0, 7],
    [11, 18],
  ]);
  expect(matchRanges('co\u0301digo', 'codigo')).toEqual([[0, 7]]);
  expect(matchRanges('😀straße', 'strasse')).toEqual([[2, 8]]);
  expect(matchRanges('ß', 's')).toEqual([[0, 1]]);
  expect(matchRanges('aaaaa', 'aa')).toEqual([
    [0, 2],
    [2, 4],
  ]);
  expect(matchRanges('Función', ' ')).toEqual([]);
  expect(matchRanges('Función', 'cion', { mode: 'startsWith' })).toEqual([]);
  expect(matchRanges('Función', 'cion', { mode: 'endsWith' })).toEqual([[3, 7]]);
});
