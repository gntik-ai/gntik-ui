import { render, screen, within } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Avatar, AvatarGroup, getInitials } from './Avatar';
import AvatarSizes from './examples/AvatarSizes';
import AvatarGroupMembers from './examples/AvatarGroupMembers';

describe('Avatar', () => {
  it('derives initials from the name', () => {
    expect(getInitials('Maria  Ruiz Gomez')).toBe('MR');
    expect(getInitials('ops')).toBe('O');
  });

  it('is one image named after the person and status, showing initials as fallback', async () => {
    render(<Avatar name="Maria Ruiz" status="online" src="/missing.png" />);
    const img = screen.getByRole('img', { name: 'Maria Ruiz (online)' });
    // jsdom never loads images, so the Base UI fallback stays visible.
    expect(await within(img).findByText('MR')).toBeInTheDocument();
  });

  it('is hidden from assistive technology without a name', () => {
    const { container } = render(<Avatar initials="AB" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies size, shape and tone', () => {
    render(<Avatar name="Sam King" size="xl" shape="rounded" tone="violet" />);
    const img = screen.getByRole('img', { name: 'Sam King' });
    expect(img).toHaveClass('size-16');
    expect(img.firstElementChild).toHaveClass('rounded-2xl', 'bg-category-violet/20');
  });

  it('AvatarGroup shows max avatars and a +N more chip', () => {
    render(
      <AvatarGroup label="Members" max={2} size="sm">
        <Avatar name="A One" />
        <Avatar name="B Two" />
        <Avatar name="C Three" />
        <Avatar name="D Four" />
      </AvatarGroup>,
    );
    const group = screen.getByRole('group', { name: 'Members' });
    expect(within(group).getAllByRole('img')).toHaveLength(2);
    expect(group).toHaveTextContent('+2 more');
    expect(within(group).getByRole('img', { name: 'A One' })).toHaveClass('size-8');
  });

  it('examples have no axe violations', async () => {
    render(<><AvatarSizes /><AvatarGroupMembers /></>);
    await expectNoAxeViolations();
  });
});
