import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { StickyActionBar } from './StickyActionBar';

describe('StickyActionBar', () => {
  it('renders the dirty state by default', async () => {
    const { container } = render(<StickyActionBar />);
    expect(screen.getByRole('region', { name: 'Save changes' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('You have unsaved changes');
    await expectNoAxeViolations(container);
  });

  it('saves, discards and disables while clean', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onCancel = vi.fn();
    const { rerender } = render(<StickyActionBar onSave={onSave} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
    rerender(<StickyActionBar dirty={false} onSave={onSave} />);
    expect(screen.getByRole('status')).toHaveTextContent('All changes saved');
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
    rerender(<StickyActionBar dirty={false} hideWhenClean />);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
