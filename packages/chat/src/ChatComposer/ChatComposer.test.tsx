import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { ChatComposer } from './ChatComposer';
import ChatComposerFull from './examples/ChatComposerFull';
import ChatComposerStreaming from './examples/ChatComposerStreaming';

describe('ChatComposer', () => {
  it('Enter sends the trimmed text and clears an uncontrolled composer', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ChatComposer onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await user.type(box, '  List open invoices  {Enter}');
    expect(onSubmit).toHaveBeenCalledWith('List open invoices', []);
    expect(box).toHaveValue('');
  });

  it('Shift+Enter inserts a new line instead of sending', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ChatComposer onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Message' });
    await user.type(box, 'first{Shift>}{Enter}{/Shift}second');
    expect(box).toHaveValue('first\nsecond');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not send an empty message', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ChatComposer onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox'), '   {Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('while streaming: shows Stop, Enter does not send, Escape stops', async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const user = userEvent.setup();
    render(<ChatComposer streaming onStop={onStop} onSubmit={onSubmit} defaultValue="next question" />);
    const box = screen.getByRole('textbox');
    await user.click(box);
    await user.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.keyboard('{Escape}');
    expect(onStop).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Stop generating' }));
    expect(onStop).toHaveBeenCalledTimes(2);
  });

  it('works controlled', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<ChatComposer value="draft" onValueChange={onValueChange} onSubmit={() => {}} />);
    await user.type(screen.getByRole('textbox'), 'x');
    expect(onValueChange).toHaveBeenCalledWith('draftx');
  });

  it('attachment chips can be removed and are in the Tab order', async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <ChatComposer
        onSubmit={() => {}}
        onAttach={() => {}}
        onRemoveAttachment={onRemove}
        attachments={[{ id: 'a', name: 'report.pdf', size: 2048 }]}
      />,
    );
    expect(screen.getByRole('list', { name: 'Attachments' })).toHaveTextContent('report.pdf2 KB');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove report.pdf' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledWith('a');
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Attach files' })).toHaveFocus();
  });

  it('passes picked files to onAttach', async () => {
    const onAttach = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<ChatComposer onSubmit={() => {}} onAttach={onAttach} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['a,b'], 'data.csv', { type: 'text/csv' });
    await user.upload(input, file);
    expect(onAttach).toHaveBeenCalledWith([file]);
  });

  it('shows the counter near the limit and blocks sending above it', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ChatComposer maxLength={10} onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox');
    await user.type(box, '123456789');
    expect(screen.getByText('9/10')).toBeInTheDocument();
    await user.type(box, '01{Enter}');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disabled state blocks typing and sending', () => {
    render(<ChatComposer disabled onSubmit={() => {}} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('examples have no axe violations', async () => {
    const { container, unmount } = render(<ChatComposerFull />);
    await expectNoAxeViolations(container);
    unmount();
    const r = render(<ChatComposerStreaming />);
    await expectNoAxeViolations(r.container);
  });
});
