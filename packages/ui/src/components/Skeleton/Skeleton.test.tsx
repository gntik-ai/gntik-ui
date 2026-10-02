import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Skeleton } from './Skeleton';
import SkeletonList from './examples/SkeletonList';
import SkeletonShapes from './examples/SkeletonShapes';

describe('Skeleton', () => {
  it('is decorative and pulses unless motion is reduced', () => {
    const { container } = render(<Skeleton className="h-8 w-24" />);
    const el = container.firstElementChild;
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el).toHaveClass('animate-pulse', 'motion-reduce:animate-none', 'h-8', 'w-24');
    expect(el).not.toHaveClass('h-4');
  });

  it('renders text lines with a shorter last line, and circles', () => {
    const { container } = render(<><Skeleton shape="text" lines={3} /><Skeleton shape="circle" /></>);
    const [text, circle] = Array.from(container.children);
    expect(text?.children).toHaveLength(3);
    expect(text?.lastElementChild).toHaveClass('w-2/3');
    expect(circle).toHaveClass('rounded-full', 'size-10');
  });

  it('the loading container is announced, not the shapes', () => {
    render(<SkeletonList />);
    expect(screen.getByRole('status', { name: 'Loading members' })).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    render(<><SkeletonList /><SkeletonShapes /></>);
    await expectNoAxeViolations();
  });
});
