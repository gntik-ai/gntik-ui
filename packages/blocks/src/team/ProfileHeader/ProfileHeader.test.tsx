import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ProfileHeader } from './ProfileHeader';

describe('ProfileHeader', () => {
  it('renders the profile', async () => {
    const { container } = render(<ProfileHeader />);
    expect(screen.getByRole('heading', { level: 1, name: 'Avery Collins' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avery Collins' })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Details' })).toHaveTextContent('avery@example.com');
    await expectNoAxeViolations(container);
  });

  it('edits and changes the avatar', async () => {
    const onEdit = vi.fn();
    const onAvatarChange = vi.fn();
    const { container } = render(<ProfileHeader onEdit={onEdit} onAvatarChange={onAvatarChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    expect(onEdit).toHaveBeenCalledOnce();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, 'click');
    await userEvent.click(screen.getByRole('button', { name: 'Change avatar' }));
    expect(click).toHaveBeenCalled();
    const file = new File(['x'], 'me.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onAvatarChange).toHaveBeenCalledWith(file);
  });
});
