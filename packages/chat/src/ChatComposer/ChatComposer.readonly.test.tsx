import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ChatComposer } from './ChatComposer';

it.each(['enter', 'mod+enter'] as const)(
  'readOnly keeps selectable text and blocks edits in %s mode',
  async (submitMode) => {
    const onSubmit = vi.fn();
    const onAttach = vi.fn();
    const onRemoveAttachment = vi.fn();
    const onRetryAttachment = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <ChatComposer
        submitMode={submitMode}
        readOnly
        defaultValue="Draft"
        attachments={[{ id: 'a', name: 'notes.md', error: true }]}
        onSubmit={onSubmit}
        onAttach={onAttach}
        onRemoveAttachment={onRemoveAttachment}
        onRetryAttachment={onRetryAttachment}
      />,
    );
    const box = screen.getByRole<HTMLTextAreaElement>('textbox');
    expect(box).toHaveAttribute('readonly');
    expect(box).not.toBeDisabled();
    await user.click(box);
    await user.keyboard('{Control>}a{/Control}');
    expect(box).toHaveFocus();
    expect([box.selectionStart, box.selectionEnd]).toEqual([0, 5]);
    await user.keyboard('x{Enter}{Control>}{Enter}{/Control}{Meta>}{Enter}{/Meta}');
    expect(box).toHaveValue('Draft');
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Attach files' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove notes.md' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry uploading notes.md' })).not.toBeInTheDocument();
    const form = container.querySelector('form')!;
    expect(form).not.toHaveAttribute('data-disabled');
    expect(form.className.split(' ').filter((c) => c.startsWith('opacity-'))).toEqual([]);
    const file = new File(['text'], 'notes.txt', { type: 'text/plain' });
    fireEvent.paste(box, { clipboardData: { files: [file] } });
    const dataTransfer = { files: [file], types: ['Files'] };
    fireEvent.dragEnter(form, { dataTransfer });
    expect(form).not.toHaveAttribute('data-dragging');
    fireEvent.drop(form, { dataTransfer });
    expect(onAttach).not.toHaveBeenCalled();
    expect(onRemoveAttachment).not.toHaveBeenCalled();
    expect(onRetryAttachment).not.toHaveBeenCalled();
  },
);

it('readOnly still allows stopping a streamed reply by keyboard or button', async () => {
  const onStop = vi.fn();
  const user = userEvent.setup();
  render(<ChatComposer readOnly streaming onStop={onStop} onSubmit={() => {}} />);
  await user.click(screen.getByRole('textbox'));
  await user.keyboard('{Escape}');
  expect(onStop).toHaveBeenCalledTimes(1);
  await user.click(screen.getByRole('button', { name: 'Stop generating' }));
  expect(onStop).toHaveBeenCalledTimes(2);
});
