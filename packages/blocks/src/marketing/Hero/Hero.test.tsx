import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Hero } from './Hero';

describe('Hero', () => {
  it('renders the centered hero with link CTAs', async () => {
    const { container } = render(<Hero />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ship your product faster');
    expect(screen.getByRole('link', { name: 'Get started' })).toHaveAttribute('href', '#get-started');
    expect(screen.getByRole('link', { name: 'Book a demo' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('renders the split variant with button actions and a custom media slot', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Hero
        variant="split"
        headingLevel="h2"
        primaryAction={{ label: 'Start free trial', onClick }}
        secondaryAction={null}
        media={<img src="data:," alt="Dashboard screenshot" />}
      />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Dashboard screenshot' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start free trial' }));
    expect(onClick).toHaveBeenCalledOnce();
    await expectNoAxeViolations(document.body);
  });
});
