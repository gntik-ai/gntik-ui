import { render, screen, within } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { FeatureGrid } from './FeatureGrid';
import { sampleFeatures } from './fixtures';

describe('FeatureGrid', () => {
  it('renders a labelled section with one item per feature', async () => {
    const { container } = render(<FeatureGrid />);
    const section = screen.getByRole('region', { name: /All the building blocks/ });
    expect(within(section).getAllByRole('listitem')).toHaveLength(sampleFeatures.length);
    expect(screen.getByRole('heading', { level: 3, name: 'Instant deployments' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('shifts feature headings with the section level', () => {
    render(<FeatureGrid headingLevel="h3" columns={2} features={sampleFeatures.slice(0, 2)} />);
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2);
  });
});
