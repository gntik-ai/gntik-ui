import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { SectionHeader } from './SectionHeader';

describe('SectionHeader', () => {
  it('renders the default header', async () => {
    const { container } = render(<SectionHeader />);
    expect(screen.getByRole('heading', { level: 2, name: 'Policies' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('shows a count and runs its actions', async () => {
    const onInvite = vi.fn();
    render(<SectionHeader title="Members" as="h3" count={8} actions={[{ label: 'Invite', variant: 'soft', onClick: onInvite }]} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Members' })).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Invite' }));
    expect(onInvite).toHaveBeenCalledTimes(1);
  });
});
