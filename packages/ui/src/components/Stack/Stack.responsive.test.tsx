import { render, screen } from '@testing-library/react';
import { HStack, VStack, Stack } from './Stack';

it('stacks a toolbar vertically at base and horizontally from md, with responsive gaps', () => {
  render(<Stack data-testid="stack" direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 4 }} />);
  expect(screen.getByTestId('stack').className).toBe('flex min-w-0 flex-col flex-nowrap md:flex-row gap-2 md:gap-4');
});

it('uses mobile defaults only for direction and wrap, with responsive alignment and distribution', () => {
  render(
    <Stack
      data-testid="stack"
      direction={{ md: 'row' }}
      wrap={{ md: true }}
      align={{ base: 'stretch', sm: 'center' }}
      justify={{ md: 'between' }}
    />,
  );
  expect(screen.getByTestId('stack').className).toBe(
    'flex min-w-0 flex-col items-stretch flex-nowrap md:flex-row sm:items-center md:justify-between md:flex-wrap',
  );
});

it('can turn wrapping off at a larger breakpoint', () => {
  render(<Stack data-testid="stack" wrap={{ base: true, lg: false }} />);
  expect(screen.getByTestId('stack').className).toBe('flex min-w-0 flex-col flex-wrap lg:flex-nowrap');
});

it('preserves fixed directions and defaults when horizontal and vertical stacks are responsive', () => {
  render(
    <>
      <HStack data-testid="horizontal" reverse gap={{ base: 2, lg: 4 }} />
      <HStack data-testid="alignment" align={{ md: 'end' }} />
      <VStack
        data-testid="vertical"
        reverse
        gap={{ '2xl': 12 }}
        align={{ sm: 'center' }}
        justify={{ md: 'between' }}
        wrap={{ lg: true }}
      />
    </>,
  );
  expect(screen.getByTestId('horizontal').className).toBe(
    'flex min-w-0 flex-row-reverse items-center flex-nowrap gap-2 lg:gap-4',
  );
  expect(screen.getByTestId('alignment').className).toBe('flex min-w-0 flex-row flex-nowrap md:items-end');
  expect(screen.getByTestId('vertical').className).toBe(
    'flex min-w-0 flex-col-reverse flex-nowrap sm:items-center md:justify-between lg:flex-wrap 2xl:gap-12',
  );
});

it('supports responsive padding and logical overrides on every stack, without adding padding by default', () => {
  const { rerender } = render(
    <Stack data-testid="stack" padding={{ base: 4, md: 6 }} paddingInline={3} paddingBlock={2} />,
  );
  expect(screen.getByTestId('stack').className).toBe('flex min-w-0 flex-col flex-nowrap p-4 md:p-6 px-3 py-2');
  for (const Component of [Stack, HStack, VStack]) {
    rerender(
      <Component
        data-testid="stack"
        padding={{ '2xl': 12 }}
        paddingInline={{ sm: 0, xl: 5 }}
        paddingBlock={{ lg: 8 }}
      />,
    );
    expect(screen.getByTestId('stack')).toHaveClass('2xl:p-12', 'sm:px-0', 'xl:px-5', 'lg:py-8');
    expect(
      screen
        .getByTestId('stack')
        .className.split(' ')
        .filter((value) => /^(p|px|py)-/.test(value)),
    ).toEqual([]);
    expect(screen.getByTestId('stack')).not.toHaveAttribute('padding');
    expect(screen.getByTestId('stack')).not.toHaveAttribute('paddingInline');
    expect(screen.getByTestId('stack')).not.toHaveAttribute('paddingBlock');
    rerender(<Component data-testid="stack" />);
    expect(screen.getByTestId('stack').className).not.toMatch(/(?:^|[: ])p[xy]?-/);
  }
});

it('keeps explicit className overrides at their own breakpoint', () => {
  const { rerender } = render(
    <Stack data-testid="stack" direction={{ md: 'row' }} gap={{ base: 2, md: 4 }} className="gap-8" />,
  );
  expect(screen.getByTestId('stack').className).toBe('flex min-w-0 flex-col flex-nowrap md:flex-row md:gap-4 gap-8');
  rerender(<Stack data-testid="stack" gap={{ base: 2, md: 4 }} className="md:gap-8" />);
  expect(screen.getByTestId('stack').className).toBe('flex min-w-0 flex-col flex-nowrap gap-2 md:gap-8');
});

it('keeps the pre-change scalar class strings, including inline and reverse', () => {
  const { container } = render(
    <>
      <Stack />
      <Stack direction="row" gap={6} align="end" justify="between" wrap className="p-2" />
      <HStack gap={3} justify="between" wrap />
      <VStack reverse gap={0} align="stretch" justify="evenly" />
      <Stack inline direction="row-reverse" gap={12} align="baseline" justify="around" />
      <HStack inline reverse gap={1} align="start" justify="end" />
      <VStack inline gap={5} align="center" justify="center" wrap />
    </>,
  );
  expect([...container.children].map((element) => element.className)).toEqual([
    'flex min-w-0 flex-col flex-nowrap',
    'flex min-w-0 flex-row items-end justify-between flex-wrap gap-6 p-2',
    'flex min-w-0 flex-row items-center justify-between flex-wrap gap-3',
    'flex min-w-0 flex-col-reverse items-stretch justify-evenly flex-nowrap gap-0',
    'min-w-0 flex-row-reverse items-baseline justify-around flex-nowrap inline-flex gap-12',
    'min-w-0 flex-row-reverse items-start justify-end flex-nowrap inline-flex gap-1',
    'min-w-0 flex-col items-center justify-center flex-wrap inline-flex gap-5',
  ]);
});
