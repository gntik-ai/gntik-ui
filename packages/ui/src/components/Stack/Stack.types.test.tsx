import { expectTypeOf } from 'vitest';
import type { Responsive } from '../../utils/responsive';
import type { SpaceScale } from './stack.variants';
import { HStack, VStack, type StackProps } from './Stack';

it('accepts responsive layout props and rejects invalid breakpoints, values and fixed directions', () => {
  expectTypeOf<StackProps['gap']>().toEqualTypeOf<Responsive<SpaceScale> | undefined>();
  expectTypeOf<StackProps['padding']>().toEqualTypeOf<Responsive<SpaceScale> | undefined>();
  expectTypeOf<StackProps['paddingInline']>().toEqualTypeOf<Responsive<SpaceScale> | undefined>();
  expectTypeOf<StackProps['paddingBlock']>().toEqualTypeOf<Responsive<SpaceScale> | undefined>();
  const invalid: StackProps[] = [
    // @ts-expect-error Unknown breakpoint.
    { direction: { tablet: 'row' } },
    // @ts-expect-error Unknown gap breakpoint.
    { gap: { tablet: 2 } },
    // @ts-expect-error Off-scale gap.
    { gap: { md: 13 } },
    // @ts-expect-error Off-scale padding.
    { padding: 13 },
    // @ts-expect-error Off-scale inline padding.
    { paddingInline: { sm: 13 } },
    // @ts-expect-error Off-scale block padding.
    { paddingBlock: 13 },
    // @ts-expect-error Unknown alignment.
    { align: { md: 'middle' } },
    // @ts-expect-error Unknown distribution.
    { justify: 'middle' },
    // @ts-expect-error Wrapping is boolean.
    { wrap: { lg: 'wrap' } },
  ];
  void invalid;
  // @ts-expect-error HStack fixes the direction.
  <HStack direction="column" />;
  // @ts-expect-error VStack fixes the direction.
  <VStack direction={{ md: 'row' }} />;
});
