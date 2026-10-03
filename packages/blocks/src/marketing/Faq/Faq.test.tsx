import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Faq } from './Faq';
import { sampleFaqs } from './fixtures';

describe('Faq', () => {
  it('renders one trigger per question', async () => {
    const { container } = render(<Faq />);
    expect(screen.getByRole('region', { name: 'Frequently asked questions' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(sampleFaqs.length);
    await expectNoAxeViolations(container);
  });

  it('opens an answer on click', async () => {
    const user = userEvent.setup();
    render(<Faq layout="split" />);
    const trigger = screen.getByRole('button', { name: 'How is usage billed?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/metered per project/)).toBeVisible();
    await expectNoAxeViolations(document.body);
  });
});
