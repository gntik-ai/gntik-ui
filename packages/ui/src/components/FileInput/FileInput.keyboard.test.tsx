import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileInput } from './FileInput';

it.each(['{Enter}', ' '])('opens from the keyboard with %s and keeps the picker outside tab order', async (key) => {
  const user = userEvent.setup();
  render(
    <>
      <FileInput clearable defaultValue={new File(['x'], 'key.pem')} />
      <button type="button">Next</button>
    </>,
  );
  const click = vi.spyOn(document.querySelector<HTMLInputElement>('input[type=file]')!, 'click');
  await user.tab();
  expect(screen.getByRole('button', { name: /Choose file/ })).toHaveFocus();
  await user.keyboard(key);
  expect(click).toHaveBeenCalledOnce();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Clear file' })).toHaveFocus();
  await user.keyboard(key);
  expect(screen.getByRole('button', { name: /Choose file/ })).toHaveFocus();
  await user.tab();
  expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: /Choose file/ })).toHaveFocus();
});
