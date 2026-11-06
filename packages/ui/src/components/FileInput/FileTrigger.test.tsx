import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileTrigger } from './FileTrigger';

it.each(['click', 'Enter', 'Space'])('FileTrigger opens on %s without submitting its form', async (key) => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  const onSubmit = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <FileTrigger accept=".yaml" multiple directory capture="environment" onSelect={onSelect}>
        Import workflow
      </FileTrigger>
    </form>,
  );
  const trigger = screen.getByRole('button', { name: 'Import workflow' });
  const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
  const click = vi.spyOn(input, 'click');
  await user.tab();
  expect(trigger).toHaveFocus();
  if (key === 'click') await user.click(trigger);
  else await user.keyboard(key === 'Enter' ? '{Enter}' : ' ');
  expect(click).toHaveBeenCalledOnce();
  expect(onSubmit).not.toHaveBeenCalled();
  const file = new File(['workflow'], 'flow.yaml');
  fireEvent.change(input, { target: { files: [file] } });
  expect(onSelect).toHaveBeenCalledExactlyOnceWith([file]);
  expect(input).toHaveAttribute('accept', '.yaml');
  expect(input).toHaveAttribute('multiple');
  expect(input).toHaveAttribute('webkitdirectory');
  expect(input).toHaveAttribute('capture', 'environment');
});

it('renders a custom control and respects disabled and prevented clicks', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<FileTrigger disabled render={<button aria-label="Import" />} />);
  const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
  const click = vi.spyOn(input, 'click');
  await user.click(screen.getByRole('button', { name: 'Import' }));
  expect(click).not.toHaveBeenCalled();
  rerender(<FileTrigger onClick={(event) => event.preventDefault()} render={<button aria-label="Import" />} />);
  await user.click(screen.getByRole('button', { name: 'Import' }));
  expect(click).not.toHaveBeenCalled();
});

it.each(['click', 'Enter', 'Space'])('supports a non-button render element on %s', async (key) => {
  const user = userEvent.setup();
  render(<FileTrigger render={<span aria-label="Import" />} />);
  const trigger = screen.getByRole('button', { name: 'Import' });
  const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
  const click = vi.spyOn(input, 'click');
  await user.tab();
  expect(trigger).toHaveFocus();
  if (key === 'click') await user.click(trigger);
  else await user.keyboard(key === 'Enter' ? '{Enter}' : ' ');
  expect(click).toHaveBeenCalledOnce();
});
