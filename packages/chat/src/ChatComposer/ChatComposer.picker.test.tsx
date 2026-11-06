import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Popover, PopoverContent, PopoverTrigger } from '@gntik-ai/ui';
import { ChatComposer } from './ChatComposer';

it('attaches the picker outside the composer and removes it when the action is hidden', () => {
  const { container, rerender } = render(<ChatComposer onSubmit={() => {}} onAttach={() => {}} accept=".json" />);
  expect(container.querySelector('input[type=file]')).toBeNull();
  expect(document.querySelector('input[type=file]')).toHaveAttribute('accept', '.json');
  expect(document.querySelector('input[type=file]')).toHaveAttribute('multiple');
  expect(screen.getByRole('button', { name: 'Attach files' })).toBeEnabled();
  rerender(<ChatComposer onSubmit={() => {}} />);
  expect(document.querySelector('input[type=file]')).toBeNull();
  rerender(<ChatComposer onSubmit={() => {}} onAttach={() => {}} readOnly />);
  expect(document.querySelector('input[type=file]')).toBeNull();
});

it('keeps attachments mounted inside a Popover until the files are delivered', async () => {
  const onAttach = vi.fn();
  render(
    <Popover defaultOpen>
      <PopoverTrigger>Open composer</PopoverTrigger>
      <PopoverContent aria-label="Compose">
        <section aria-label="Chat composer">
          <ChatComposer onSubmit={() => {}} onAttach={onAttach} />
        </section>
      </PopoverContent>
    </Popover>,
  );
  const panel = screen.getByRole('dialog', { name: 'Compose' });
  await waitFor(() => expect(panel).toBeVisible());
  const picker = document.querySelector<HTMLInputElement>('input[type=file]')!;
  fireEvent.click(screen.getByRole('button', { name: 'Attach files' }));
  const file = new File(['key'], 'key.json');
  fireEvent.change(picker, { target: { files: [file] } });
  expect(panel).toBeVisible();
  expect(onAttach).toHaveBeenCalledExactlyOnceWith([file]);
  expect(screen.getByRole('region', { name: 'Chat composer' }).querySelector('input[type=file]')).toBeNull();
});
