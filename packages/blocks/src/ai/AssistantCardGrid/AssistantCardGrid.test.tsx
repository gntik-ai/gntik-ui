import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { AssistantCardGrid } from './AssistantCardGrid';

describe('AssistantCardGrid', () => {
  it('renders one card per assistant with status and runtime', async () => {
    render(<AssistantCardGrid onCreate={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Assistants' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByText('6 total · 2 active')).toBeInTheDocument();
    expect(screen.getAllByText('Degraded')).toHaveLength(1);
    expect(screen.getByText('reasoning-small · self-hosted')).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('calls onSelect and onCreate', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onCreate = vi.fn();
    render(<AssistantCardGrid onSelect={onSelect} onCreate={onCreate} />);
    await user.click(screen.getByRole('button', { name: 'Invoice checker' }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'a3' }));
    await user.click(screen.getByRole('button', { name: 'New assistant' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state', () => {
    render(<AssistantCardGrid assistants={[]} />);
    expect(screen.getByText('No assistants yet')).toBeInTheDocument();
  });
});
