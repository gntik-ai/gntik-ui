import { defaultItemLabel, hasExactLabel } from './specialItems';

it('finds exact option labels inside groups, without treating headings as options', () => {
  const items = [
    {
      value: 'Europe',
      items: [
        { value: 'par', label: 'Paris' },
        { value: 'mad', label: 'Madrid' },
      ],
    },
    { value: 'Americas', items: [{ value: 'tor', label: 'Toronto' }] },
  ];
  expect(hasExactLabel(items, ' PARIS ', defaultItemLabel)).toBe(true);
  expect(hasExactLabel(items, 'Lisbon', defaultItemLabel)).toBe(false);
  expect(hasExactLabel(items, 'Europe', defaultItemLabel)).toBe(false);
});
