import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { CostBreakdown } from './CostBreakdown';

describe('CostBreakdown', () => {
  it('uses the kit locale for an empty chart', () => {
    render(
      <I18nProvider locale="es">
        <CostBreakdown items={[]} />
      </I18nProvider>,
    );
    expect(screen.getByText('Sin datos para este periodo')).toBeInTheDocument();
  });

  it('renders the donut figure and the total', async () => {
    const { container } = render(<CostBreakdown />);
    expect(screen.getByRole('figure', { name: /Cost breakdown: Compute \$740.00/ })).toBeInTheDocument();
    expect(screen.getByText('$1,620.00')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('ranks categories by amount with their share', () => {
    render(<CostBreakdown />);
    const items = within(screen.getByRole('list', { name: 'Categories by cost' })).getAllByRole('listitem');
    expect(items.map((li) => li.textContent)).toEqual([
      expect.stringContaining('Compute'),
      expect.stringContaining('Tokens'),
      expect.stringContaining('Add-ons'),
      expect.stringContaining('Storage'),
    ]);
    expect(items[0]).toHaveTextContent('45.7%');
  });
});
