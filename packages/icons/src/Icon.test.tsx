import { render, screen } from '@testing-library/react';
import { Bot, Icon, ICON_SIZE } from './index';

describe('Icon', () => {
  it('is decorative by default at the md brand size', () => {
    const { container } = render(<Icon icon={Bot} />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('width', String(ICON_SIZE.md));
  });
  it('is announced as an image with a label', () => {
    render(<Icon icon={Bot} label="Agent" size="xl" />);
    expect(screen.getByRole('img', { name: 'Agent' })).toHaveAttribute('width', '20');
  });
});
