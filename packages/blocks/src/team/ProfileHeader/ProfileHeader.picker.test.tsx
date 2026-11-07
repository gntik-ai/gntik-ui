import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Popover, PopoverContent, PopoverTrigger } from '@gntik-ai/ui';
import { ProfileHeader } from './ProfileHeader';

it('attaches the avatar picker outside the block and removes it when the action is hidden', () => {
  const { container, rerender } = render(<ProfileHeader />);
  expect(container.querySelector('input[type=file]')).toBeNull();
  expect(document.querySelector('input[type=file]')).toHaveAttribute('accept', 'image/*');
  rerender(<ProfileHeader onAvatarChange={null} />);
  expect(document.querySelector('input[type=file]')).toBeNull();
});

it('keeps the avatar action mounted inside a Popover until the file is delivered', async () => {
  const onAvatarChange = vi.fn();
  render(
    <Popover defaultOpen>
      <PopoverTrigger>Open profile</PopoverTrigger>
      <PopoverContent aria-label="Profile">
        <section aria-label="Profile header">
          <ProfileHeader onAvatarChange={onAvatarChange} />
        </section>
      </PopoverContent>
    </Popover>,
  );
  const panel = screen.getByRole('dialog', { name: 'Profile' });
  await waitFor(() => expect(panel).toBeVisible());
  const picker = document.querySelector<HTMLInputElement>('input[type=file]')!;
  fireEvent.click(screen.getByRole('button', { name: 'Change avatar' }));
  const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
  fireEvent.change(picker, { target: { files: [file] } });
  expect(panel).toBeVisible();
  expect(onAvatarChange).toHaveBeenCalledExactlyOnceWith(file);
  expect(screen.getByRole('region', { name: 'Profile header' }).querySelector('input[type=file]')).toBeNull();
});
