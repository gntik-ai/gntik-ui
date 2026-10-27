import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Grid, GridItem } from './Grid';
import GridResponsive from './examples/GridResponsive';
import GridAutoFill from './examples/GridAutoFill';

describe('Grid', () => {
  it('keeps the exact class strings of the existing examples', () => {
    const { container } = render(
      <>
        <GridResponsive />
        <GridAutoFill />
      </>,
    );
    expect([...container.children].map((element) => element.className)).toEqual([
      'grid min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
      'grid min-w-0 gap-3',
    ]);
    expect(container.querySelector('.col-span-1')?.className).toBe('min-w-0 col-span-1 sm:col-span-2 lg:col-span-3');
  });

  it('keeps scalar and existing responsive class strings', () => {
    const { container } = render(
      <>
        <Grid cols={3} gap={6} />
        <Grid cols={{ base: 1, md: 2, xl: 12 }} rowGap={8} />
        <Grid cols={4}>
          <GridItem span={2} />
          <GridItem span={{ base: 'full', lg: 3 }} />
        </Grid>
      </>,
    );
    expect([...container.children].map((element) => element.className)).toEqual([
      'grid min-w-0 grid-cols-3 gap-6',
      'grid min-w-0 grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 gap-y-8',
      'grid min-w-0 grid-cols-4 gap-4',
    ]);
    expect([...container.querySelectorAll('.grid > div')].map((element) => element.className)).toEqual([
      'min-w-0 col-span-2',
      'min-w-0 col-span-full lg:col-span-3',
    ]);
  });

  it('supports 2xl columns, numeric spans and full spans', () => {
    render(
      <Grid data-testid="wide" cols={{ base: 1, '2xl': 6 }}>
        <GridItem data-testid="span" span={{ base: 1, '2xl': 6 }} />
        <GridItem data-testid="full" span={{ '2xl': 'full' }} />
      </Grid>,
    );
    expect(screen.getByTestId('wide')).toHaveClass('grid-cols-1', '2xl:grid-cols-6');
    expect(screen.getByTestId('span')).toHaveClass('col-span-1', '2xl:col-span-6');
    expect(screen.getByTestId('full')).toHaveClass('2xl:col-span-full');
  });

  it('maps responsive gaps on both axes, and separate row and column gaps', () => {
    render(
      <Grid
        data-testid="g"
        cols={{ base: 1, '2xl': 6 }}
        gap={{ base: 2, lg: 6 }}
        rowGap={{ base: 1, md: 3, '2xl': 12 }}
        columnGap={{ base: 0, sm: 4, xl: 8 }}
      />,
    );
    expect(screen.getByTestId('g').className).toBe(
      'grid min-w-0 grid-cols-1 2xl:grid-cols-6 gap-2 lg:gap-6 gap-y-1 md:gap-y-3 2xl:gap-y-12 gap-x-0 sm:gap-x-4 xl:gap-x-8',
    );
  });

  it('maps a fixed column count and gap', () => {
    render(<Grid data-testid="g" cols={3} gap={6} />);
    expect(screen.getByTestId('g')).toHaveClass('grid', 'grid-cols-3', 'gap-6');
  });

  it('maps a responsive object to breakpoint classes', () => {
    render(<Grid data-testid="g" cols={{ base: 1, md: 2, xl: 12 }} rowGap={8} />);
    const g = screen.getByTestId('g');
    expect(g).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-12', 'gap-4', 'gap-y-8');
    expect(g).not.toHaveClass('sm:grid-cols-1');
  });

  it('minChildWidth auto-fills through an inline template and ignores cols', () => {
    const { rerender } = render(<Grid data-testid="g" cols={4} minChildWidth="14rem" style={{ padding: 4 }} />);
    const g = screen.getByTestId('g');
    expect(g.style.gridTemplateColumns).toBe('repeat(auto-fill, minmax(min(14rem, 100%), 1fr))');
    expect(g.style.padding).toBe('4px');
    expect(g).not.toHaveClass('grid-cols-4');
    rerender(<Grid data-testid="g" minChildWidth={200} />);
    expect(screen.getByTestId('g').style.gridTemplateColumns).toContain('200px');
  });

  it('GridItem spans columns, responsively or fully', () => {
    render(
      <Grid cols={4}>
        <GridItem data-testid="a" span={2} />
        <GridItem data-testid="b" span={{ base: 'full', lg: 3 }} />
      </Grid>,
    );
    expect(screen.getByTestId('a')).toHaveClass('col-span-2');
    expect(screen.getByTestId('b')).toHaveClass('col-span-full', 'lg:col-span-3');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <GridResponsive />
        <GridAutoFill />
      </>,
    );
    expect(screen.getByRole('list', { name: 'Projects' })).toHaveClass('grid');
    await expectNoAxeViolations();
  });
});
