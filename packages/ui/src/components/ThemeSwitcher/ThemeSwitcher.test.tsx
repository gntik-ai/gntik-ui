import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ThemeProvider } from '../../theme/ThemeProvider';
import ThemeSwitcherCycle from './examples/ThemeSwitcherCycle';
import ThemeSwitcherSegmented from './examples/ThemeSwitcherSegmented';
import { ThemeSwitcher } from './ThemeSwitcher';

function setup() {
  const user = userEvent.setup();
  render(
    <ThemeProvider storageKey={null} defaultMode="dark">
      <button type="button">Before</button>
      <ThemeSwitcher />
    </ThemeProvider>,
  );
  const get = (name: string) => screen.getByRole('button', { name });
  return { user, light: get('Light'), dark: get('Dark'), hc: get('High contrast'), system: get('System') };
}

describe('ThemeSwitcher', () => {
  it('reflects the current mode as the pressed option', () => {
    const { dark, light } = setup();
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(dark).toHaveAttribute('aria-pressed', 'true');
    expect(light).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement).toHaveClass('dark');
  });

  it('Tab enters the group and arrow keys move between options (wrapping)', async () => {
    const { user, light, dark, hc, system } = setup();
    await user.tab();
    await user.tab();
    expect([light, dark]).toContain(document.activeElement);
    dark.focus();
    await user.keyboard('{ArrowRight}');
    expect(hc).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(system).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(light).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(system).toHaveFocus();
  });

  it('Enter / Space select the focused option and apply the theme', async () => {
    const { user, dark, hc, light } = setup();
    dark.focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(hc).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).toHaveClass('high_contrast');
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(light).toHaveFocus();
    await user.keyboard(' ');
    expect(light).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).not.toHaveClass('high_contrast');
  });

  it('pressing the selected option keeps it selected', async () => {
    const { user, dark } = setup();
    await user.click(dark);
    expect(dark).toHaveAttribute('aria-pressed', 'true');
  });

  it('the cycle button moves to the next mode with Enter / Space', async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcherCycle />);
    const button = screen.getByRole('button', { name: 'Theme: Dark. Switch to High contrast' });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(/mode: high_contrast/)).toBeInTheDocument();
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: 'Theme: System. Switch to Light' })).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <ThemeSwitcherSegmented />
        <ThemeSwitcherCycle />
      </>,
    );
    expect(screen.getByRole('group', { name: 'Theme (compact)' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});
