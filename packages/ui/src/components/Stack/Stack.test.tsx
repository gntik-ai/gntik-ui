import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Center, HStack, Stack, VStack } from './Stack';
import StackToolbarRow from './examples/StackToolbarRow';
import StackCenter from './examples/StackCenter';

describe('Stack', () => {
  it('maps gap, align, justify and wrap to static classes', () => {
    render(<Stack data-testid="s" direction="row" gap={6} align="end" justify="between" wrap className="p-2" />);
    expect(screen.getByTestId('s')).toHaveClass('flex', 'flex-row', 'gap-6', 'items-end', 'justify-between', 'flex-wrap', 'p-2');
  });

  it('defaults to a column and covers the whole 0–12 gap scale', () => {
    const { rerender } = render(<Stack data-testid="s" />);
    expect(screen.getByTestId('s')).toHaveClass('flex-col');
    for (const g of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const) {
      rerender(<Stack data-testid="s" gap={g} />);
      expect(screen.getByTestId('s')).toHaveClass(`gap-${g}`);
    }
  });

  it('HStack / VStack set the direction; reverse flips it', () => {
    render(
      <>
        <HStack data-testid="h" />
        <VStack data-testid="v" reverse />
      </>,
    );
    expect(screen.getByTestId('h')).toHaveClass('flex-row', 'items-center');
    expect(screen.getByTestId('v')).toHaveClass('flex-col-reverse');
  });

  it('renders as another tag with `as` or any element with `render`', () => {
    render(
      <>
        <Stack as="ul" aria-label="Members"><li>Ada</li></Stack>
        <HStack render={<nav aria-label="Sections" />} gap={2}>x</HStack>
      </>,
    );
    expect(screen.getByRole('list', { name: 'Members' })).toHaveClass('flex');
    expect(screen.getByRole('navigation', { name: 'Sections' })).toHaveClass('flex-row', 'gap-2');
  });

  it('Center centres on both axes and can be inline', () => {
    render(<Center inline data-testid="c" />);
    expect(screen.getByTestId('c')).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('examples have no axe violations', async () => {
    render(<><StackToolbarRow /><StackCenter /></>);
    await expectNoAxeViolations();
  });
});
