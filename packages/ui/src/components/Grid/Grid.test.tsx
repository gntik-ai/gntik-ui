import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Grid, GridItem } from './Grid';
import GridResponsive from './examples/GridResponsive';
import GridAutoFill from './examples/GridAutoFill';

describe('Grid', () => {
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
    render(<><GridResponsive /><GridAutoFill /></>);
    expect(screen.getByRole('list', { name: 'Projects' })).toHaveClass('grid');
    await expectNoAxeViolations();
  });
});
