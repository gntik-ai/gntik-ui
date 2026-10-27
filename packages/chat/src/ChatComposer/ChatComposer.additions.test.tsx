import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';
import { ChatComposer } from './ChatComposer';

describe('ChatComposer additive API', () => {
  it('preserves the original default DOM', () => {
    const { container } = render(<ChatComposer onSubmit={() => {}} />);
    // React IDs vary with test order; their relationships remain visible in the snapshot.
    expect(container.innerHTML.replace(/_r_[^" ]+_/g, 'composer-id')).toMatchSnapshot();
  });

  it('mod+enter adds lines on Enter and sends exactly once for either modifier', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatComposer submitMode="mod+enter" value="line one" onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox');
    await user.click(box);
    // Use an uncontrolled composer below to exercise actual newline insertion.
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: 'Enter', ctrlKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(box, { key: 'Enter', metaKey: true });
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('types a multiline message before sending with Ctrl+Enter', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ChatComposer submitMode="mod+enter" onSubmit={onSubmit} />);
    await user.type(screen.getByRole('textbox'), 'line one{Enter}line two{Control>}{Enter}{/Control}');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('line one\nline two', []);
  });

  it.each(['enter', 'mod+enter'] as const)('%s never sends during IME composition', (submitMode) => {
    const onSubmit = vi.fn();
    render(<ChatComposer submitMode={submitMode} defaultValue="draft" onSubmit={onSubmit} />);
    for (const modifiers of [{}, { ctrlKey: true }, { metaKey: true }]) {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', isComposing: true, ...modifiers });
    }
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
