import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ResourceDetailPage from './Page';

describe('ResourceDetailPage', () => {
  it('renders the header with status and the overview tab', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceDetailPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'orders-api' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'Configuration' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Status history' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches to Activity with the keyboard', { timeout: 15000 }, async () => {
    const onTabChange = vi.fn();
    render(<ResourceDetailPage onTabChange={onTabChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onTabChange).toHaveBeenCalledWith('activity');
    expect(screen.getByRole('region', { name: 'Activity, newest first' })).toBeInTheDocument();
  });

  it('saves the settings form and shows the danger zone', { timeout: 15000 }, async () => {
    const onSaveSettings = vi.fn();
    const { container } = render(<ResourceDetailPage defaultTab="settings" onSaveSettings={onSaveSettings} />);
    const save = screen.getByRole('button', { name: 'Save changes' });
    expect(save).toBeDisabled();
    const nameInput = screen.getByRole('textbox', { name: /Name/ });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'orders-api-v2');
    await userEvent.click(save);
    expect(onSaveSettings).toHaveBeenCalledWith(expect.objectContaining({ name: 'orders-api-v2' }));
    expect(screen.getByRole('heading', { name: 'Danger zone' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
