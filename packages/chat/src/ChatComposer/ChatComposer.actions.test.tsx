import { act, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChatComposer, type ChatComposerActions } from './ChatComposer';

describe.each([false, true])('actions (controlled: %s)', (controlled) => {
  it('inserts at the caret, replaces selections, inserts at either end and keeps the textarea ref', () => {
    const actions = createRef<ChatComposerActions>();
    const ref = createRef<HTMLTextAreaElement>();
    const onValueChange = vi.fn();
    function Example() {
      const [value, setValue] = useState('Hello ');
      return (
        <ChatComposer
          ref={ref}
          actionsRef={actions}
          {...(controlled ? { value } : { defaultValue: 'Hello ' })}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
          onSubmit={() => {}}
        />
      );
    }
    render(<Example />);
    const box = screen.getByRole<HTMLTextAreaElement>('textbox');
    expect(ref.current).toBe(box);
    box.setSelectionRange(6, 6);
    act(() => actions.current!.insert('{{name}}'));
    expect(onValueChange).toHaveBeenLastCalledWith('Hello {{name}}');
    expect(box).toHaveValue('Hello {{name}}');
    expect(box.selectionStart).toBe(14);
    expect(box.selectionEnd).toBe(14);
    expect(actions.current!.getValue()).toBe('Hello {{name}}');
    box.setSelectionRange(6, 14);
    act(() => actions.current!.insert('Ana'));
    expect(box).toHaveValue('Hello Ana');
    expect(box.selectionStart).toBe(9);
    act(() => actions.current!.insert('>', 'start'));
    expect(box).toHaveValue('>Hello Ana');
    expect(box.selectionStart).toBe(1);
    act(() => actions.current!.insert('!', 'end'));
    expect(box).toHaveValue('>Hello Ana!');
    expect(box.selectionStart).toBe(11);
  });

  it('focuses at start/end or selects all and clears only text', () => {
    const actions = createRef<ChatComposerActions>();
    const onValueChange = vi.fn();
    const onRemoveAttachment = vi.fn();
    function Example() {
      const [value, setValue] = useState('Draft');
      return (
        <ChatComposer
          actionsRef={actions}
          {...(controlled ? { value } : { defaultValue: 'Draft' })}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
          onSubmit={() => {}}
          attachments={[{ id: 'a', name: 'notes.md' }]}
          onRemoveAttachment={onRemoveAttachment}
        />
      );
    }
    render(<Example />);
    const box = screen.getByRole<HTMLTextAreaElement>('textbox');
    for (const [cursor, start, end] of [
      ['start', 0, 0],
      ['end', 5, 5],
      ['all', 0, 5],
    ] as const) {
      act(() => actions.current!.focus(cursor));
      expect(box).toHaveFocus();
      expect([box.selectionStart, box.selectionEnd]).toEqual([start, end]);
    }
    act(() => actions.current!.clear());
    expect(onValueChange).toHaveBeenLastCalledWith('');
    expect(actions.current!.getValue()).toBe('');
    expect(box).toHaveValue('');
    expect(screen.getByRole('list', { name: 'Attachments' })).toHaveTextContent('notes.md');
    expect(onRemoveAttachment).not.toHaveBeenCalled();
  });
});
