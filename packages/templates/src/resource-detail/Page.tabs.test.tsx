import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectTypeOf } from 'vitest';
import type { ComponentProps } from 'react';
import { expectNoAxeViolations } from '../test/a11y';
import ResourceDetailPage, { type ResourceDetailTab } from './Page';

const tabs = [
  { value: 'A', label: 'First section', content: <p>Content A</p> },
  { value: 'B', label: 'Second section', content: <p>Content B</p> },
  { value: 'C', label: 'Third section', content: <p>Content C</p> },
];

it('replaces built-in tabs with caller labels, order and content', async () => {
  const user = userEvent.setup();
  render(<ResourceDetailPage tabs={tabs} />);
  expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
    'First section',
    'Second section',
    'Third section',
  ]);
  for (const name of ['Overview', 'Activity', 'Settings']) {
    expect(screen.queryByRole('tab', { name })).not.toBeInTheDocument();
  }
  expect(screen.getByText('Content A')).toBeVisible();
  await user.click(screen.getByRole('tab', { name: 'Second section' }));
  await waitFor(() => expect(screen.getAllByRole('tabpanel')).toHaveLength(1));
  expect(within(screen.getByRole('tabpanel')).getByText('Content B')).toBeVisible();
  expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  expect(screen.queryByText('Content C')).not.toBeInTheDocument();
});

it('uses caller defaults, panel associations and manual keyboard activation', async () => {
  const user = userEvent.setup();
  const onTabChange = vi.fn();
  render(<ResourceDetailPage tabs={tabs} defaultTab="B" onTabChange={onTabChange} />);
  const first = screen.getByRole('tab', { name: 'First section' });
  const second = screen.getByRole('tab', { name: 'Second section' });
  const third = screen.getByRole('tab', { name: 'Third section' });
  expect(second).toHaveAttribute('aria-selected', 'true');
  act(() => second.focus());
  await user.keyboard('{ArrowRight}');
  expect(third).toHaveFocus();
  expect(second).toHaveAttribute('aria-selected', 'true');
  expect(onTabChange).not.toHaveBeenCalled();
  await user.keyboard('{Enter}');
  expect(third).toHaveAttribute('aria-selected', 'true');
  expect(onTabChange).toHaveBeenCalledWith('C');
  await user.keyboard('{Home}');
  expect(first).toHaveFocus();
  await user.keyboard('{End}');
  expect(third).toHaveFocus();
  for (const tab of [first, second, third]) {
    await user.click(tab);
    const panel = await screen.findByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  }
});

it('falls back to the first caller tab for an unknown default', () => {
  render(<ResourceDetailPage tabs={tabs} defaultTab="unknown" />);
  expect(screen.getByRole('tab', { name: 'First section' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByText('Content A')).toBeVisible();
});

it('renders only the heading and header when caller tabs are empty', () => {
  render(<ResourceDetailPage tabs={[]} />);
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
});

it('selects the first caller tab when no default is supplied, including built-in value names', () => {
  render(<ResourceDetailPage tabs={[tabs[0]!, { ...tabs[1]!, value: 'overview' }]} />);
  expect(screen.getByRole('tab', { name: 'First section' })).toHaveAttribute('aria-selected', 'true');
});

it('does not filter custom tabs or their selection in read-only mode', async () => {
  const user = userEvent.setup();
  render(<ResourceDetailPage readOnly name="Resource record" tabs={tabs.slice(0, 2)} />);
  expect(screen.getAllByRole('tab')).toHaveLength(2);
  await user.click(screen.getByRole('tab', { name: 'Second section' }));
  expect(screen.getByText('Content B')).toBeVisible();
});

it.each([undefined, null])('keeps custom tabs accessible with shell=%s', { timeout: 15000 }, async (shell) => {
  const { container } = render(
    <ResourceDetailPage shell={shell} tabs={tabs} labels={{ sections: 'Record sections' }} />,
  );
  expect(screen.getByRole('tablist', { name: 'Record sections' })).toBeVisible();
  await expectNoAxeViolations(container);
});

it('keeps built-in callback values narrow and custom callback values as strings', () => {
  type Props = ComponentProps<typeof ResourceDetailPage>;
  type BuiltIn = Extract<Props, { tabs?: undefined }>;
  type Custom = Extract<Props, { tabs: unknown[] }>;
  expectTypeOf<BuiltIn['defaultTab']>().toEqualTypeOf<ResourceDetailTab | undefined>();
  expectTypeOf<NonNullable<BuiltIn['onTabChange']>>().parameter(0).toEqualTypeOf<ResourceDetailTab>();
  expectTypeOf<Custom['defaultTab']>().toEqualTypeOf<string | undefined>();
  expectTypeOf<NonNullable<Custom['onTabChange']>>().parameter(0).toEqualTypeOf<string>();
  expectTypeOf<{ defaultTab: 'B' }>().not.toExtend<Props>();
});

it('smoke-loads the embedded custom tabs preview inside one accessible main', { timeout: 15000 }, async () => {
  const { default: EmbeddedCustomTabs } = await import('./examples/embedded-custom-tabs');
  const { container } = render(<EmbeddedCustomTabs />);
  expect(screen.getAllByRole('main')).toHaveLength(1);
  expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Summary', 'Output']);
  await userEvent.click(screen.getByRole('tab', { name: 'Output' }));
  expect(screen.getByText('The resource completed successfully.')).toBeVisible();
  await expectNoAxeViolations(container);
});
