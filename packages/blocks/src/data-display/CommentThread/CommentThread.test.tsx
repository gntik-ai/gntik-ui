import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { CommentThread } from './CommentThread';

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
});
