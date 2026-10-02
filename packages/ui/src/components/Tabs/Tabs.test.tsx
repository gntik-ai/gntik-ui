import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Tabs, TabsList, TabsPanel, TabsTab } from './Tabs';
import TabsUnderline from './examples/TabsUnderline';
import TabsPills from './examples/TabsPills';
import TabsWithIcons from './examples/TabsWithIcons';

function Basic({ onChange }: { onChange?: (v: unknown) => void }) {
  return (
    <Tabs defaultValue="a" onValueChange={onChange}>
      <TabsList aria-label="Sections">
        <TabsTab value="a">Alpha</TabsTab>
        <TabsTab value="b">Beta</TabsTab>
        <TabsTab value="c">Gamma</TabsTab>
      </TabsList>
      <TabsPanel value="a">Alpha panel</TabsPanel>
      <TabsPanel value="b">Beta panel <button type="button">Inside</button></TabsPanel>
      <TabsPanel value="c">Gamma panel</TabsPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('exposes tablist, tabs and a labelled tabpanel', () => {
    render(<Basic />);
    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(within(list).getAllByRole('tab')).toHaveLength(3);
    const alpha = screen.getByRole('tab', { name: 'Alpha' });
    expect(alpha).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Alpha' })).toHaveTextContent('Alpha panel');
  });

  it('ArrowRight / ArrowLeft move focus between tabs and wrap', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveFocus();
  });

  it('Home / End move focus to the first / last tab', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.tab();
    await user.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveFocus();
  });

  it('Enter / Space activate the focused tab', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Basic onChange={onChange} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('tab', { name: 'Beta' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: 'Beta' })).toHaveTextContent('Beta panel');
    await user.keyboard('{ArrowRight}');
    await user.keyboard(' ');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute('aria-selected', 'true');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('Tab moves from the active tab into its panel', async () => {
    const user = userEvent.setup();
    render(<Basic />);
    await user.click(screen.getByRole('tab', { name: 'Beta' }));
    await user.tab();
    const panel = screen.getByRole('tabpanel', { name: 'Beta' });
    expect(panel.contains(document.activeElement) || panel === document.activeElement).toBe(true);
  });

  it('renders count badges, icons and skips disabled tabs', async () => {
    const user = userEvent.setup();
    render(<TabsUnderline />);
    expect(screen.getByRole('tab', { name: /Deployments/ })).toHaveTextContent('1,284');
    const settings = screen.getByRole('tab', { name: 'Settings' });
    expect(settings).toHaveAttribute('aria-disabled', 'true');
    await user.click(settings);
    expect(settings).toHaveAttribute('aria-selected', 'false');
  });

  it('pills variant styles the list and supports full width', () => {
    render(<TabsPills />);
    expect(screen.getByRole('tablist', { name: 'Time range' })).toHaveClass('rounded-lg', 'bg-secondary/40');
    expect(screen.getByRole('tablist', { name: 'Report' })).toHaveClass('grid', 'w-full');
  });

  it('examples have no axe violations', async () => {
    render(<><TabsUnderline /><TabsPills /><TabsWithIcons /></>);
    await expectNoAxeViolations();
  });
});
