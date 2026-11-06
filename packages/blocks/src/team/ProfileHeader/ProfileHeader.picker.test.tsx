import { render } from '@testing-library/react';
import { ProfileHeader } from './ProfileHeader';

it('attaches the avatar picker outside the block and removes it when the action is hidden', () => {
  const { container, rerender } = render(<ProfileHeader />);
  expect(container.querySelector('input[type=file]')).toBeNull();
  expect(document.querySelector('input[type=file]')).toHaveAttribute('accept', 'image/*');
  rerender(<ProfileHeader onAvatarChange={null} />);
  expect(document.querySelector('input[type=file]')).toBeNull();
});
