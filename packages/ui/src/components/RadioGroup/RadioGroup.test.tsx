import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Radio, RadioGroup } from './RadioGroup';
import RadioGroupCards from './examples/RadioGroupCards';
import RadioGroupList from './examples/RadioGroupList';

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

describe('RadioGroup', () => {
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

  it('examples have no axe violations', async () => {
    render(
      <>
        <RadioGroupList />
        <RadioGroupCards />
      </>,
    );
    await expectNoAxeViolations();
  });
});
