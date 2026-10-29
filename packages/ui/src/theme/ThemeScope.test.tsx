import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import { ThemeScope } from './ThemeScope';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { usePortalContainer } from '../utils/portal';
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger } from '../components/Select/Select';
import { expectNoAxeViolations } from '../test/a11y';

function FruitSelect({ container }: { container?: HTMLElement }) {
  return (
    <Select defaultOpen items={[{ value: 'apple', label: 'Apple' }]}>
      <SelectLabel>Fruit</SelectLabel>
      <SelectTrigger placeholder="Choose fruit" />
      <SelectContent container={container}>
        <SelectItem value="apple">Apple</SelectItem>
      </SelectContent>
    </Select>
  );
}

it('portals an initially open Select into the light scope and passes axe', async () => {
  const previousClassName = document.documentElement.className;
  document.documentElement.className = 'dark';
  try {
    const { container } = render(
      <ThemeScope theme="light">
        <FruitSelect />
      </ThemeScope>,
    );
    const listbox = await screen.findByRole('listbox');
    const portal = listbox.closest('[data-theme-scope-portal]');
    expect(portal).toHaveClass('light');
    expect(portal?.parentElement).toBe(document.body);
    expect(container.querySelector('[role="listbox"]')).toBeNull();
    await expectNoAxeViolations();
  } finally {
    document.documentElement.className = previousClassName;
  }
});

it('lets an explicit Select container win over the scope', async () => {
  const explicit = document.createElement('div');
  document.body.appendChild(explicit);
  const { unmount } = render(
    <ThemeScope theme="light">
      <FruitSelect container={explicit} />
    </ThemeScope>,
  );
  try {
    const listbox = await screen.findByRole('listbox');
    expect(explicit).toContainElement(listbox);
    expect(listbox.closest('[data-theme-scope-portal]')).toBeNull();
  } finally {
    unmount();
    explicit.remove();
  }
});

it('keeps the default body portal outside a scope', async () => {
  const { container } = render(<FruitSelect />);
  const listbox = await screen.findByRole('listbox');
  expect(document.body).toContainElement(listbox);
  expect(container).not.toContainElement(listbox);
  expect(document.querySelector('[data-theme-scope-portal]')).toBeNull();
  expect(listbox.closest('[data-base-ui-portal]')?.parentElement).toBe(document.body);
});

function Probe() {
  const { mode, resolved, setMode } = useTheme();
  const portal = usePortalContainer();
  return (
    <button onClick={() => setMode('dark')} data-portal={portal?.dataset.themeScopePortal}>
      {mode}/{resolved}
    </button>
  );
}

it('scopes resolved while keeping page mode and setMode, and supports Base UI render', async () => {
  const user = userEvent.setup();
  const { container } = render(
    <ThemeProvider defaultMode="high_contrast" storageKey={null}>
      <ThemeScope theme="light" className="rounded-lg" render={<section />}>
        <ThemeScope theme="dark">
          <Probe />
        </ThemeScope>
      </ThemeScope>
    </ThemeProvider>,
  );
  const outer = container.querySelector('section');
  expect(outer).toHaveClass('light', 'rounded-lg');
  expect(outer).toHaveAttribute('data-theme-scope', 'light');
  expect(outer?.firstElementChild).toHaveClass('dark');
  expect(screen.getByRole('button')).toHaveTextContent('high_contrast/dark');
  expect(document.documentElement).toHaveClass('high_contrast');
  await user.click(screen.getByRole('button'));
  expect(document.documentElement).toHaveClass('dark');
  expect(screen.getByRole('button')).toHaveTextContent('dark/dark');
});

it('owns one body portal per scope, updates its theme and removes it on unmount', () => {
  const { rerender, unmount } = render(
    <ThemeScope theme="light">
      <Probe />
    </ThemeScope>,
  );
  const portal = document.querySelector('[data-theme-scope-portal]');
  expect(portal?.parentElement).toBe(document.body);
  expect(portal).toHaveClass('light');
  expect(screen.getByRole('button')).toHaveAttribute('data-portal', 'light');
  rerender(
    <ThemeScope theme="dark">
      <Probe />
    </ThemeScope>,
  );
  expect(document.querySelectorAll('[data-theme-scope-portal]')).toHaveLength(1);
  expect(document.querySelector('[data-theme-scope-portal]')).toBe(portal);
  expect(document.querySelector('[data-theme-scope-portal]')).toHaveClass('dark');
  expect(portal).toHaveAttribute('data-theme-scope-portal', 'dark');
  unmount();
  expect(document.querySelector('[data-theme-scope-portal]')).toBeNull();
});

it('defaults to no portal outside a scope and creates no portal during SSR', () => {
  render(<Probe />);
  expect(screen.getByRole('button')).not.toHaveAttribute('data-portal');
  expect(
    renderToString(
      <ThemeScope theme="light">
        <Probe />
      </ThemeScope>,
    ),
  ).toContain('data-theme-scope="light"');
  expect(document.querySelector('[data-theme-scope-portal]')).toBeNull();
});

it('carries the nearest DOM palette into an initially open portal and follows palette changes', async () => {
  const { rerender } = render(
    <ThemeProvider palette="green">
      <div data-palette="navy">
        <ThemeScope theme="light">
          <FruitSelect />
        </ThemeScope>
      </div>
    </ThemeProvider>,
  );
  const listbox = await screen.findByRole('listbox');
  const portal = listbox.closest('[data-theme-scope-portal]');
  expect(portal).toHaveAttribute('data-palette', 'navy');
  rerender(
    <ThemeProvider palette="green">
      <div data-palette="green">
        <ThemeScope theme="light">
          <FruitSelect />
        </ThemeScope>
      </div>
    </ThemeProvider>,
  );
  await vi.waitFor(() => expect(portal).toHaveAttribute('data-palette', 'green'));
});

it('carries a palette selected on the ThemeScope itself into its portal', async () => {
  render(
    <ThemeScope theme="light" data-palette="navy">
      <FruitSelect />
    </ThemeScope>,
  );
  const listbox = await screen.findByRole('listbox');
  expect(listbox.closest('[data-theme-scope-portal]')).toHaveAttribute('data-palette', 'navy');
});
