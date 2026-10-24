import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DescriptionListCard } from './DescriptionListCard';

describe('DescriptionListCard', () => {
  it.each(['rejected', 'missing'] as const)(
    'reports a %s clipboard write as failed without calling onCopy',
    async (failure) => {
      userEvent.setup();
      const clipboard = navigator.clipboard;
      if (failure === 'missing')
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
      else vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
      const onCopy = vi.fn();
      try {
        const { container } = render(<DescriptionListCard onCopy={onCopy} />);
        fireEvent.click(screen.getByRole('button', { name: 'Copy Deployment ID' }));
        const button = await screen.findByRole('button', { name: 'Copy failed' });
        expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent('Copy failed');
        expect(screen.queryByRole('button', { name: 'Deployment ID copied' })).toBeNull();
        expect(button.querySelector('.lucide-check')).toBeNull();
        expect(onCopy).not.toHaveBeenCalled();
      } finally {
        Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
        vi.restoreAllMocks();
      }
    },
  );
  it('renders labels and values', async () => {
    const { container } = render(<DescriptionListCard onEdit={() => {}} />);
    expect(screen.getByText('Deployment ID')).toBeInTheDocument();
    expect(screen.getByText('dep_7f3c9a21')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('copies a value and calls onEdit', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    const onCopy = vi.fn();
    const onEdit = vi.fn();
    render(<DescriptionListCard onCopy={onCopy} onEdit={onEdit} />);
    await user.click(screen.getByRole('button', { name: 'Copy Deployment ID' }));
    expect(writeText).toHaveBeenCalledWith('dep_7f3c9a21');
    expect(onCopy).toHaveBeenCalledWith(expect.objectContaining({ id: 'id' }));
    expect(screen.getByRole('button', { name: 'Deployment ID copied' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalled();
  });
});
