import { STACK_PADDING, STACK_PADDING_INLINE, STACK_PADDING_BLOCK } from './stack-padding.variants';
import { BREAKPOINTS } from '../../utils/responsive';
import { GRID_GAP, STACK_DIRECTION, STACK_ALIGN, STACK_JUSTIFY, STACK_WRAP } from './stack.variants';

it('provides full literal classes for every layout value and breakpoint', () => {
  for (const table of [
    GRID_GAP,
    STACK_DIRECTION,
    STACK_ALIGN,
    STACK_JUSTIFY,
    STACK_WRAP,
    STACK_PADDING,
    STACK_PADDING_INLINE,
    STACK_PADDING_BLOCK,
  ]) {
    expect(Object.keys(table)).toEqual([...BREAKPOINTS]);
    for (const bp of BREAKPOINTS) {
      expect(Object.keys(table[bp])).toEqual(Object.keys(table.base));
      for (const value of Object.values(table[bp])) {
        expect(typeof value).toBe('string');
        expect(value).toMatch(bp === 'base' ? /^[a-z]+-[a-z0-9-]+$/ : new RegExp(`^${bp}:[a-z]+-[a-z0-9-]+$`));
      }
    }
  }
  expect(Object.keys(GRID_GAP.base)).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
});

it('covers all thirteen spacing steps in every padding table', () => {
  for (const table of [STACK_PADDING, STACK_PADDING_INLINE, STACK_PADDING_BLOCK]) {
    for (const bp of BREAKPOINTS) {
      expect(Object.keys(table[bp])).toEqual(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);
    }
  }
});
