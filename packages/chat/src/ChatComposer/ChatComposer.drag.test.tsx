import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { ChatComposer } from './ChatComposer';

it.each(['text/plain', 'text/uri-list'])('suppresses native %s drops when attachments are enabled', (type) => {
  const onAttach = vi.fn();
  render(<ChatComposer onSubmit={vi.fn()} onAttach={onAttach} defaultValue="Draft" />);
  const textbox = screen.getByRole('textbox', { name: 'Message' });
  const drop = createEvent.drop(textbox, { dataTransfer: { types: [type], files: [] } });
  fireEvent(textbox, drop);
  expect(drop.defaultPrevented).toBe(true);
  expect(textbox).toHaveValue('Draft');
  expect(textbox.closest('form')).not.toHaveAttribute('data-dragging');
  expect(onAttach).not.toHaveBeenCalled();
});
