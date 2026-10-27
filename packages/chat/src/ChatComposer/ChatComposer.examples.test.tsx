import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import ChatComposerQuoteReply from './examples/ChatComposerQuoteReply';
import ChatComposerModEnter from './examples/ChatComposerModEnter';

it.each(['dark', 'light', 'high_contrast'])('new examples have no axe violations in %s', async (theme) => {
  document.documentElement.className = theme;
  for (const Example of [ChatComposerQuoteReply, ChatComposerModEnter]) {
    const { container, unmount } = render(<Example />);
    await expectNoAxeViolations(container);
    unmount();
  }
});

it('quote reply demonstrates insertion, reading, selection, clearing and closing the header', async () => {
  const user = userEvent.setup();
  render(<ChatComposerQuoteReply />);
  const box = screen.getByRole<HTMLTextAreaElement>('textbox');
  await user.click(box);
  box.setSelectionRange(6, 6);
  await user.click(screen.getByRole('button', { name: 'Insert name' }));
  expect(box).toHaveValue('Hello {{name}}');
  await user.click(screen.getByRole('button', { name: 'Read text' }));
  expect(screen.getByText('Current text: Hello {{name}}')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Select text' }));
  expect(box).toHaveFocus();
  expect([box.selectionStart, box.selectionEnd]).toEqual([0, 14]);
  await user.click(screen.getByRole('button', { name: 'Clear text' }));
  expect(box).toHaveValue('');
  await user.click(screen.getByRole('button', { name: 'Close Replying to Ana' }));
  expect(screen.queryByText('Replying to Ana')).not.toBeInTheDocument();
});

it('mod+enter example demonstrates selectable read-only text and multiline submission', async () => {
  const user = userEvent.setup();
  render(<ChatComposerModEnter />);
  const box = screen.getByRole('textbox');
  await user.click(screen.getByRole('button', { name: 'Read-only draft' }));
  expect(box).toHaveAttribute('readonly');
  await user.click(screen.getByRole('button', { name: 'Edit draft' }));
  expect(box).not.toHaveAttribute('readonly');
  fireEvent.change(box, { target: { value: 'line one' } });
  await user.type(box, '{Enter}line two{Meta>}{Enter}{/Meta}');
  expect(box).toHaveValue('');
  expect(screen.getByText('Current text: line one line two', { exact: false })).toBeInTheDocument();
});
