import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DescriptionListCard } from './DescriptionListCard';

describe('DescriptionListCard', () => {
  it('renders labels and values', async () => {
    const { container } = render(<DescriptionListCard onEdit={() => {}} />);
    expect(screen.getByText('Deployment ID')).toBeInTheDocument();
    expect(screen.getByText('dep_7f3c9a21')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('copies a value and calls onEdit', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    const onCopy = vi.fn();
    const onEdit = vi.fn();
    render(<DescriptionListCard onCopy={onCopy} onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: 'Copy Deployment ID' }));
    expect(writeText).toHaveBeenCalledWith('dep_7f3c9a21');
    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ id: 'id' }));
    expect(screen.getByRole('button', { name: 'Deployment ID copied' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalled();
  });
});
