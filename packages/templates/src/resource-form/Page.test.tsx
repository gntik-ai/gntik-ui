import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ResourceFormPage from './Page';

describe('ResourceFormPage', () => {
  it('renders the form sections and a clean save bar', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceFormPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Edit project' })).toBeInTheDocument();
    for (const name of ['General', 'Region', 'Billing']) expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    // ValidationSummary links target control ids.
    expect(screen.getByRole('combobox', { name: /Region/ })).toHaveAttribute('id', 'region');
    await expectNoAxeViolations(container);
  });

  it('shows the validation summary and focuses the field from its link', { timeout: 15000 }, async () => {
    const onSubmit = vi.fn();
    const { container } = render(<ResourceFormPage onSubmit={onSubmit} />);
    const email = screen.getByRole('textbox', { name: /Billing email/ });
    await userEvent.clear(email);
    await userEvent.type(email, 'not-an-email');
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).not.toHaveBeenCalled();
    const summary = screen.getByRole('region', { name: /There is 1 problem/ });
    await waitFor(() => expect(summary).toHaveFocus());
    await userEvent.click(screen.getByRole('link', { name: /Billing email/ }));
    expect(email).toHaveFocus();
    await expectNoAxeViolations(container);

    await userEvent.clear(email);
    await userEvent.type(email, 'finance@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ billingEmail: 'finance@example.com' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled());
  });
});
