import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expect, it, vi } from 'vitest';
import { ChatComposer } from './ChatComposer';
import { ChatComposerHeader } from './ChatComposerHeader';

it('places slots inside the form in reading and keyboard order', async () => {
  const onClose = vi.fn();
  const user = userEvent.setup();
  const { container } = render(
    <ChatComposer
      defaultValue="draft"
      header={
        <ChatComposerHeader title="Replying to Ana" onClose={onClose}>
          <p>Quoted text</p>
        </ChatComposerHeader>
      }
      prefix={<span>Agent</span>}
      footer={<p>Footer</p>}
      attachments={[{ id: 'a', name: 'notes.md' }]}
      onRemoveAttachment={() => {}}
      tools={<button type="button">Tool</button>}
      onSubmit={() => {}}
    />,
  );
  const form = container.querySelector('form')!;
  const header = within(form).getByText('Replying to Ana');
  const attachments = within(form).getByRole('list');
  const box = within(form).getByRole('textbox');
  const tool = within(form).getByRole('button', { name: 'Tool' });
  const footer = within(form).getByText('Footer');
  for (const [before, after] of [
    [header, attachments],
    [attachments, box],
    [box, tool],
    [tool, footer],
  ]) {
    expect(before!.compareDocumentPosition(after!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }
  expect(
    footer.compareDocumentPosition(container.querySelector('kbd')!) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(box.parentElement).toContainElement(within(form).getByText('Agent'));
  expect(within(form).getByText('Agent').compareDocumentPosition(box) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  for (const target of [
    screen.getByRole('button', { name: 'Close Replying to Ana' }),
    screen.getByRole('button', { name: 'Remove notes.md' }),
    box,
    tool,
    screen.getByRole('button', { name: 'Send message' }),
  ]) {
    await user.tab();
    expect(target).toHaveFocus();
  }
  await user.click(screen.getByRole('button', { name: 'Close Replying to Ana' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it.each(['en', 'es'])('uses the generic translated close name for a non-string title in %s', async (locale) => {
  const onClose = vi.fn();
  const user = userEvent.setup();
  render(
    <I18nProvider locale={locale}>
      <ChatComposerHeader title={<strong>Quote</strong>} onClose={onClose} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: locale === 'es' ? 'Cerrar' : 'Close' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('keeps the forwarded textarea ref when prefix is added or removed', () => {
  const ref = createRef<HTMLTextAreaElement>();
  const { rerender } = render(<ChatComposer ref={ref} onSubmit={() => {}} />);
  rerender(<ChatComposer ref={ref} prefix={<span>Agent</span>} onSubmit={() => {}} />);
  expect(ref.current).toBe(screen.getByRole('textbox'));
  rerender(<ChatComposer ref={ref} onSubmit={() => {}} />);
  expect(ref.current).toBe(screen.getByRole('textbox'));
});
