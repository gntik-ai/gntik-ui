import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import CreateWizardPage from './Page';

describe('CreateWizardPage', () => {
  it('renders the wizard shell on the first step', { timeout: 15000 }, async () => {
    const { container } = render(<CreateWizardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Project details' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/ })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it('walks to the review step, edits, and finishes', { timeout: 15000 }, async () => {
    const onFinish = vi.fn();
    const { container } = render(<CreateWizardPage onFinish={onFinish} />);
    await userEvent.type(screen.getByRole('textbox', { name: /Project name/ }), 'orders-api');
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    await userEvent.click(screen.getByRole('radio', { name: 'Start from a template' }));
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Review and create' })).toBeInTheDocument();
    expect(screen.getByText('Start from a template')).toBeInTheDocument();
    await expectNoAxeViolations(container);

    await userEvent.click(screen.getByRole('button', { name: 'Edit details' }));
    expect(screen.getByRole('textbox', { name: /Project name/ })).toHaveValue('orders-api');
    for (let i = 0; i < 3; i++) await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    await userEvent.click(screen.getByRole('button', { name: /Create project/ }));
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ name: 'orders-api', source: 'template', region: 'eu-west-1' }));
    expect(await screen.findByText('Project “orders-api” created')).toBeInTheDocument();
  });

  it('takes its copy from the `copy` prop', { timeout: 15000 }, async () => {
    render(<CreateWizardPage copy={{ detailsTitle: 'Agent details', nameLabel: 'Agent name', submitLabel: 'Create agent', reviewTitle: 'Review the agent' }} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Agent details' })).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: /Agent name/ }), 'triage-bot');
    for (let i = 0; i < 3; i++) await userEvent.click(screen.getByRole('button', { name: /Next/ }));
    expect(screen.getByRole('heading', { level: 1, name: 'Review the agent' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create agent/ })).toBeInTheDocument();
    expect(screen.getByText('Agent name')).toBeInTheDocument();
  });
});
