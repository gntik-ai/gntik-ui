import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Plus } from 'lucide-react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Button, IconButton } from './Button';
import ButtonVariants from './examples/ButtonVariants';
import ButtonStates from './examples/ButtonStates';
import ButtonCursorPolicy from './examples/ButtonCursorPolicy';

describe('Button', () => {
  it.each(['primary', 'secondary', 'soft', 'ghost', 'destructive'] as const)(
    '%s keeps disabled and loading controls inert with guarded hover styles',
    async (variant) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <>
          <Button variant={variant} disabled onClick={onClick}>
            Off
          </Button>
          <Button variant={variant} loading onClick={onClick}>
            Busy
          </Button>
        </>,
      );
      const off = screen.getByRole('button', { name: 'Off' });
      const busy = screen.getByRole('button', { name: 'Busy' });
      for (const button of [off, busy]) {
        expect(button).toHaveAttribute('data-disabled');
        expect(button).toHaveClass('cursor-interactive', 'data-[disabled]:cursor-disabled');
        expect(button.className).not.toContain('pointer-events-none');
        const hoverClasses = [...button.classList].filter((name) => name.includes('hover:'));
        expect(hoverClasses.length).toBeGreaterThan(0);
        for (const name of hoverClasses) expect(name).toMatch(/^not-data-\[disabled\]:hover:/);
        await user.hover(button);
        await user.click(button);
        await user.unhover(button);
      }
      await user.tab();
      expect(busy).toHaveFocus();
      await user.keyboard('{Enter} ');
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  it('activates with click, Enter and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    await user.click(btn);
    await user.tab();
    await user.tab({ shift: true });
    expect(btn).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('does not fire while disabled or loading; loading stays focusable', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <>
        <Button disabled onClick={onClick}>
          Off
        </Button>
        <Button loading onClick={onClick}>
          Busy
        </Button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Off' }));
    const busy = screen.getByRole('button', { name: 'Busy' });
    await user.click(busy);
    expect(onClick).not.toHaveBeenCalled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
    await user.tab();
    expect(busy).toHaveFocus();
  });

  it('IconButton uses its label as the accessible name', () => {
    render(<IconButton icon={Plus} label="Add item" />);
    expect(screen.getByRole('button', { name: 'Add item' })).toHaveClass('size-control');
  });

  it('applies variant classes and merges className', () => {
    render(
      <Button variant="soft" className="px-8">
        Soft
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Soft' });
    expect(btn).toHaveClass('text-primary-chip-text', 'px-8');
    expect(btn).not.toHaveClass('px-control');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <ButtonVariants />
        <ButtonStates />
        <ButtonCursorPolicy />
      </>,
    );
    await expectNoAxeViolations();
  });
});
