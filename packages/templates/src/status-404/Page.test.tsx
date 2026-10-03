import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import Status404Page from './Page';

describe('Status404Page', () => {
  it('renders the not-found message with landmarks and a way home', async () => {
    render(<Status404Page />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'We can’t find that page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Contact support' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('calls onBack from Go back', async () => {
    const onBack = vi.fn();
    render(<Status404Page onBack={onBack} homeHref="/projects" />);
    await userEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Go to dashboard' })).toHaveAttribute('href', '/projects');
  });
});
