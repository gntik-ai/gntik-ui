import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Section } from './Section';
import SectionSettings from './examples/SectionSettings';
import SectionVariants from './examples/SectionVariants';

describe('Section', () => {
  it('is a region named by its title and described by its description', () => {
    render(<SectionSettings />);
    const region = screen.getByRole('region', { name: 'Notifications' });
    expect(region).toHaveAccessibleDescription('Choose what reaches your inbox.');
    expect(screen.getByRole('heading', { level: 2, name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset' }).parentElement).toHaveClass('col-start-2');
    expect(region).toHaveClass('bg-card', 'p-5');
  });

  it('divided draws rules under the header and between children', () => {
    render(
      <Section divided title="Members" data-testid="s" bodyClassName="extra">
        <div>One</div>
        <div>Two</div>
      </Section>,
    );
    expect(screen.getByRole('heading', { name: 'Members' }).parentElement).toHaveClass('border-b');
    const body = screen.getByText('One').parentElement;
    expect(body).toHaveClass('divide-y', 'divide-border', 'extra');
  });

  it('renders without a header; variants and padding map to classes', () => {
    render(<Section variant="muted" padding="lg" data-testid="s">Body</Section>);
    const s = screen.getByTestId('s');
    expect(s.tagName).toBe('SECTION');
    expect(s).not.toHaveAttribute('aria-labelledby');
    expect(s).toHaveClass('bg-secondary/50', 'p-6');
    expect(s.querySelector('.grid')).toBeNull();
  });

  it('examples have no axe violations', async () => {
    render(<><SectionSettings /><SectionVariants /></>);
    await expectNoAxeViolations();
  });
});
