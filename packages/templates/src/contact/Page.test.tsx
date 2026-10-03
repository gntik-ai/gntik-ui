import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ContactPage from './Page';
import { offices } from './data';

describe('ContactPage', () => {
  it('renders the form and office cards', { timeout: 15000 }, async () => {
    render(<ContactPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Talk to us' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Contact form' })).toBeInTheDocument();
    const officesRegion = screen.getByRole('region', { name: 'Offices' });
    expect(within(officesRegion).getAllByRole('heading', { level: 3 })).toHaveLength(offices.length);
    await expectNoAxeViolations();
  });

  it('validates, then sends and shows the success state', { timeout: 15000 }, async () => {
    const onSubmit = vi.fn();
    render(<ContactPage onSubmit={onSubmit} defaultValues={{ topic: 'sales' }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByText('Enter your name.').length).toBeGreaterThan(0);
    await userEvent.type(screen.getByRole('textbox', { name: /^Name/ }), 'Ada Example');
    await userEvent.type(screen.getByRole('textbox', { name: /Work email/ }), 'ada@example.com');
    await userEvent.type(screen.getByRole('textbox', { name: /Message/ }), 'We would like a demo for 40 seats.');
    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Ada Example', topic: 'sales' }));
    expect(await screen.findByRole('heading', { name: 'Message sent' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveFocus();
    await expectNoAxeViolations();
  });
});
