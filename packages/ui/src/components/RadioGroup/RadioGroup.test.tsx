import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Radio, RadioGroup } from './RadioGroup';
import RadioGroupCards from './examples/RadioGroupCards';
import RadioGroupInline from './examples/RadioGroupInline';
import RadioGroupList from './examples/RadioGroupList';
import RadioGroupWithAccessibleLabel from './examples/RadioGroupWithAccessibleLabel';

function Sizes() {
  return (
    <>
      <button type="button">Before</button>
      <RadioGroup aria-label="Size" defaultValue="m">
        <Radio value="s" label="Small" />
        <Radio value="m" label="Medium" />
        <Radio value="l" label="Large" />
      </RadioGroup>
      <button type="button">After</button>
    </>
  );
}

function Cycle({
  orientation,
  variant,
}: {
  orientation?: 'vertical' | 'horizontal';
  variant?: 'plain' | 'list' | 'card';
}) {
  return (
    <RadioGroup aria-label="Billing cycle" orientation={orientation} variant={variant} defaultValue="monthly">
      <Radio value="monthly" label="Monthly" />
      <Radio value="annual" label="Annual" />
    </RadioGroup>
  );
}

function HorizontalSizes() {
  return (
    <>
      <button type="button">Before</button>
      <RadioGroup aria-label="Size" orientation="horizontal" defaultValue="m">
        <Radio value="s" label="Small" />
        <Radio value="m" label="Medium" />
        <Radio value="l" label="Large" />
      </RadioGroup>
      <button type="button">After</button>
    </>
  );
}

describe('RadioGroup', () => {
  it('shows label precedence with consistent visible and accessible labels in the live example', async () => {
    render(<RadioGroupWithAccessibleLabel />);
    expect(screen.getByRole('radio', { name: 'Email me' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Email me about updates' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it.each([
    [undefined, 'Email me'],
    ['Notify', 'Notify'],
  ])('uses accessible name %s / %s when a visible label is present', (ariaLabel, name) => {
    render(
      <RadioGroup aria-label="Notifications">
        <Radio value="email" label="Email me" aria-label={ariaLabel} />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name })).toHaveAttribute('aria-checked', 'false');
  });

  it('exposes radiogroup and radios with names and descriptions', () => {
    render(<RadioGroupList />);
    const group = screen.getByRole('radiogroup', { name: 'Failure strategy' });
    expect(group).toBeInTheDocument();
    const retry = screen.getByRole('radio', { name: 'Retry three times' });
    expect(retry).toHaveAttribute('aria-checked', 'true');
    expect(retry).toHaveAccessibleDescription('Calls the same service again with backoff before failing.');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('Tab enters the group once, on the selected radio, and Tab again leaves it', async () => {
    const user = userEvent.setup();
    render(<Sizes />);
    screen.getByRole('button', { name: 'Before' }).focus();
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Medium' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('radio', { name: 'Medium' })).toHaveFocus();
  });

  it('Arrow Down / Right move to the next radio and select it, wrapping at the end', async () => {
    const user = userEvent.setup();
    render(<Sizes />);
    screen.getByRole('button', { name: 'Before' }).focus();
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const large = screen.getByRole('radio', { name: 'Large' });
    await waitFor(() => expect(large).toHaveFocus());
    expect(large).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowRight}');
    const small = screen.getByRole('radio', { name: 'Small' });
    await waitFor(() => expect(small).toHaveFocus());
    expect(small).toHaveAttribute('aria-checked', 'true');
  });

  it('Arrow Up / Left move to the previous radio and select it, wrapping at the start', async () => {
    const user = userEvent.setup();
    render(<Sizes />);
    screen.getByRole('button', { name: 'Before' }).focus();
    await user.tab();
    await user.keyboard('{ArrowUp}');
    const small = screen.getByRole('radio', { name: 'Small' });
    await waitFor(() => expect(small).toHaveFocus());
    expect(small).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowLeft}');
    const large = screen.getByRole('radio', { name: 'Large' });
    await waitFor(() => expect(large).toHaveFocus());
    expect(large).toHaveAttribute('aria-checked', 'true');
  });

  it('Space selects the focused radio when nothing is selected', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup aria-label="Region" onValueChange={onValueChange}>
        <Radio value="eu" label="Europe" />
        <Radio value="us" label="United States" />
      </RadioGroup>,
    );
    await user.tab();
    const eu = screen.getByRole('radio', { name: 'Europe' });
    expect(eu).toHaveFocus();
    expect(eu).toHaveAttribute('aria-checked', 'false');
    await user.keyboard(' ');
    expect(eu).toHaveAttribute('aria-checked', 'true');
    expect(onValueChange).toHaveBeenCalledWith('eu', expect.anything());
  });

  it('card variant: Fieldset names the group, disabled options are skipped and clicks select', async () => {
    const user = userEvent.setup();
    render(<RadioGroupCards />);
    expect(screen.getByRole('radiogroup', { name: 'Deployment plan' })).toBeInTheDocument();
    const isolated = screen.getByRole('radio', { name: 'Isolated' });
    expect(isolated).toHaveAttribute('aria-disabled', 'true');
    expect(isolated).toHaveAccessibleDescription('$240/mo Private network · no neighbours');
    await user.click(screen.getByText('Shared'));
    expect(screen.getByRole('radio', { name: 'Shared' })).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(screen.getByRole('radio', { name: 'Shared' })).toHaveFocus());
    expect(isolated).toHaveAttribute('aria-checked', 'false');
  });

  describe('orientation', () => {
    it('marks a horizontal group with data-orientation and a wrapping row', () => {
      render(<Cycle orientation="horizontal" />);
      const group = screen.getByRole('radiogroup', { name: 'Billing cycle' });
      expect(group).toHaveAttribute('data-orientation', 'horizontal');
      expect(group).toHaveClass('flex-row', 'flex-wrap');
      expect(group).not.toHaveClass('flex-col');
    });

    it.each([undefined, 'vertical' as const])('keeps the vertical DOM when orientation is %s', (orientation) => {
      render(<Cycle orientation={orientation} />);
      const group = screen.getByRole('radiogroup', { name: 'Billing cycle' });
      expect(group).not.toHaveAttribute('data-orientation');
      expect(group.className).toBe('flex flex-col gap-2.5');
    });

    it('lays horizontal cards out in equal auto-fit columns that keep the checked ring', () => {
      render(<Cycle orientation="horizontal" variant="card" />);
      const group = screen.getByRole('radiogroup', { name: 'Billing cycle' });
      expect(group).toHaveClass('grid', 'grid-cols-[repeat(auto-fit,minmax(min(100%,12rem),1fr))]');
      expect(group).not.toHaveClass('flex');
      expect(group.innerHTML).toContain('has-[[data-checked]]:border-primary/60');
      expect(group.innerHTML).toContain('has-[[data-checked]]:ring-2');
    });

    it('list ignores horizontal and keeps the vertical divided rows', () => {
      const { unmount } = render(<Cycle variant="list" />);
      const vertical = screen.getByRole('radiogroup').className;
      unmount();
      render(<Cycle variant="list" orientation="horizontal" />);
      const group = screen.getByRole('radiogroup');
      expect(group.className).toBe(vertical);
      expect(group).toHaveAttribute('data-orientation', 'horizontal');
      expect(group).toHaveClass('flex-col', 'divide-y');
    });

    it('keeps one Tab stop on the selected radio of a horizontal group', async () => {
      const user = userEvent.setup();
      render(<HorizontalSizes />);
      screen.getByRole('button', { name: 'Before' }).focus();
      await user.tab();
      expect(screen.getByRole('radio', { name: 'Medium' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('Arrow Right / Down select the next radio of a horizontal group and wrap', async () => {
      const user = userEvent.setup();
      render(<HorizontalSizes />);
      screen.getByRole('button', { name: 'Before' }).focus();
      await user.tab();
      await user.keyboard('{ArrowRight}');
      const large = screen.getByRole('radio', { name: 'Large' });
      await waitFor(() => expect(large).toHaveFocus());
      expect(large).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowDown}');
      const small = screen.getByRole('radio', { name: 'Small' });
      await waitFor(() => expect(small).toHaveFocus());
      expect(small).toHaveAttribute('aria-checked', 'true');
    });

    it('Arrow Left / Up select the previous radio of a horizontal group and wrap', async () => {
      const user = userEvent.setup();
      render(<HorizontalSizes />);
      screen.getByRole('button', { name: 'Before' }).focus();
      await user.tab();
      await user.keyboard('{ArrowLeft}');
      const small = screen.getByRole('radio', { name: 'Small' });
      await waitFor(() => expect(small).toHaveFocus());
      expect(small).toHaveAttribute('aria-checked', 'true');
      await user.keyboard('{ArrowUp}');
      const large = screen.getByRole('radio', { name: 'Large' });
      await waitFor(() => expect(large).toHaveFocus());
      expect(large).toHaveAttribute('aria-checked', 'true');
    });

    it('the inline example renders both horizontal groups with names from the catalog', () => {
      render(<RadioGroupInline />);
      expect(screen.getByRole('radiogroup', { name: 'Billing cycle' })).toHaveAttribute(
        'data-orientation',
        'horizontal',
      );
      expect(screen.getAllByRole('radiogroup')).toHaveLength(2);
    });
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <RadioGroupList />
        <RadioGroupCards />
        <RadioGroupInline />
      </>,
    );
    await expectNoAxeViolations();
  });
});
