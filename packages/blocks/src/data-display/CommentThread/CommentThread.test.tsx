import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { CommentThread, type ThreadComment } from './CommentThread';

const comment: ThreadComment = {
  id: 'review',
  author: { name: 'Reviewer' },
  body: '**retry**\n<img src=x onerror=alert(1)>',
  at: '2026-10-01T12:00:00Z',
};

describe('CommentThread', () => {
  it('renders the comments and an empty composer', async () => {
    const { container } = render(<CommentThread />);
    expect(screen.getByRole('list', { name: '3 comments' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Comment' })).toBeDisabled();
    await expectNoAxeViolations(container);
  });

  it('posts a reply with the button and with Ctrl+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CommentThread onSubmit={onSubmit} />);
    const box = screen.getByRole('textbox', { name: 'Write a comment' });
    await user.type(box, '  Merged, thanks!  ');
    await user.click(screen.getByRole('button', { name: 'Comment' }));
    expect(onSubmit).toHaveBeenCalledWith('Merged, thanks!');
    expect(screen.getByText('Merged, thanks!')).toBeInTheDocument();
    expect(box).toHaveValue('');
    await user.type(box, 'Follow-up');
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(onSubmit).toHaveBeenLastCalledWith('Follow-up');
    expect(screen.getByRole('list', { name: '5 comments' })).toBeInTheDocument();
  });

  it('keeps plain bodies as text in a paragraph with line breaks', () => {
    const { container } = render(<CommentThread comments={[comment]} />);
    const body = screen.getByText(/\*\*retry\*\*/);
    expect(body.tagName).toBe('P');
    expect(body).toHaveClass('whitespace-pre-line');
    expect(body.textContent).toBe('**retry**\n<img src=x onerror=alert(1)>');
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders full supplied and appended comments through a block container', async () => {
    const user = userEvent.setup();
    const currentUser = { name: 'Writer' };
    const renderBody = vi.fn((c: ThreadComment) => <blockquote>{c.body}</blockquote>);
    render(<CommentThread comments={[comment]} currentUser={currentUser} renderBody={renderBody} />);
    expect(renderBody).toHaveBeenCalledExactlyOnceWith(comment);
    const body = screen.getByText(/\*\*retry\*\*/);
    expect(body.parentElement?.tagName).toBe('DIV');
    expect(body.closest('p')).toBeNull();
    await user.type(screen.getByRole('textbox'), 'See **docs**');
    renderBody.mockClear();
    await user.keyboard('{Control>}{Enter}{/Control}');
    expect(renderBody).toHaveBeenCalledTimes(2);
    expect(renderBody).toHaveBeenCalledWith(comment);
    expect(renderBody).toHaveBeenCalledWith({
      id: 'local-1',
      author: currentUser,
      body: 'See **docs**',
      at: expect.any(Number),
    });
    const posted = screen.getByText('See **docs**');
    expect(posted.parentElement?.tagName).toBe('DIV');
    expect(posted.closest('p')).toBeNull();
  });

  it.each([
    ['en', false, 'Plain text · ⌘/Ctrl + Enter to post'],
    ['en', true, 'Markdown supported · ⌘/Ctrl + Enter to post'],
    ['es', false, 'Texto sin formato · ⌘/Ctrl + Intro para publicar'],
    ['es', true, 'Admite Markdown · ⌘/Ctrl + Intro para publicar'],
  ])('describes the composer in %s with renderBody=%s', (locale, rich, hint) => {
    render(
      <I18nProvider locale={locale}>
        <CommentThread renderBody={rich ? (c) => <blockquote>{c.body}</blockquote> : undefined} />
      </I18nProvider>,
    );
    expect(screen.getByText(hint)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription(hint);
  });

  it.each([false, true])('uses the custom hint with renderBody=%s', (rich) => {
    render(
      <CommentThread
        renderBody={rich ? (c) => <blockquote>{c.body}</blockquote> : undefined}
        composerHint={<em>Notes are visible to the workspace</em>}
      />,
    );
    expect(screen.getByText('Notes are visible to the workspace').tagName).toBe('EM');
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Notes are visible to the workspace');
    expect(screen.queryByText(/⌘\/Ctrl/)).not.toBeInTheDocument();
  });
});
