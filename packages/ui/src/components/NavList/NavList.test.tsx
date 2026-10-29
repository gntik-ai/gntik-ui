import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home, Rocket, Settings } from 'lucide-react';
import { expectNoAxeViolations } from '../../test/a11y';
import NavListSettings from './examples/NavListSettings';
import NavListSidebar from './examples/NavListSidebar';
import { NavList, type NavGroup } from './NavList';

const GROUPS: NavGroup[] = [
  {
    label: 'Main',
    collapsible: true,
    items: [
      { label: 'Home', href: '/home', icon: Home },
      { label: 'Deployments', href: '/deployments', icon: Rocket, badge: 3 },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        label: 'Settings',
        icon: Settings,
        items: [
          { label: 'General', href: '/settings/general' },
          { label: 'Billing', href: '/settings/billing' },
        ],
      },
    ],
  },
];

describe('NavList', () => {
  it('renders a labelled nav with grouped lists and aria-current="page"', () => {
    render(<NavList groups={GROUPS} currentHref="/deployments" label="Primary" />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).getByRole('list', { name: 'Main' })).toBeInTheDocument();
    const current = within(nav).getByRole('link', { name: 'Deployments 3' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
  });

  it('Tab moves through items and toggles in order', async () => {
    const user = userEvent.setup();
    render(<NavList groups={GROUPS} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Main' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Deployments 3' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus();
  });

  it('Enter follows a link through the LinkProvider router link', async () => {
    const user = userEvent.setup();
    render(<NavListSidebar />);
    const nav = screen.getByRole('navigation', { name: 'Workspace' });
    const overview = within(nav).getByRole('link', { name: 'Overview' });
    expect(overview).toHaveAttribute('data-router-link');
    overview.focus();
    await user.keyboard('{Enter}');
    expect(overview).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Projects 12' })).not.toHaveAttribute('aria-current');
  });

  it('Enter / Space on a group heading folds and unfolds it', async () => {
    const user = userEvent.setup();
    render(<NavList groups={GROUPS} />);
    const toggle = screen.getByRole('button', { name: 'Main' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument());
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('nested sections open with Enter / Space and start open around the current page', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<NavList groups={GROUPS} />);
    const section = screen.getByRole('button', { name: 'Settings' });
    expect(section).toHaveAttribute('aria-expanded', 'false');
    section.focus();
    await user.keyboard(' ');
    expect(section).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Billing' })).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(section).toHaveAttribute('aria-expanded', 'false');
    unmount();
    render(<NavList groups={GROUPS} currentHref="/settings/billing" />);
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute('aria-current', 'page');
  });

  it('collapsed rail hides labels, names items (with badge) and shows a tooltip on focus', async () => {
    const user = userEvent.setup();
    render(<NavList groups={GROUPS} collapsed />);
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Deployments (3)' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Home');
  });

  it('collapsed rail opens nested sections as a flyout menu', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<NavList groups={GROUPS} collapsed onNavigate={onNavigate} currentHref="/settings/general" />);
    const trigger = screen.getByRole('button', { name: 'Settings' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'General' })).toHaveAttribute('aria-current', 'page');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('the sidebar example toggles the rail', async () => {
    const user = userEvent.setup();
    render(<NavListSidebar />);
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(screen.getByRole('link', { name: 'Projects (12)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('button items run onClick and disabled items are skipped', async () => {
    const user = userEvent.setup();
    render(<NavListSettings />);
    const nav = screen.getByRole('navigation', { name: 'Settings' });
    expect(within(nav).getByRole('button', { name: 'Members' })).toHaveAttribute('aria-current', 'page');
    await user.click(within(nav).getByRole('button', { name: 'Security' }));
    expect(within(nav).getByRole('button', { name: 'Security' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Integrations' })).toBeDisabled();
  });

  it('examples have no axe violations (expanded and rail)', async () => {
    const user = userEvent.setup();
    render(
      <>
        <NavListSidebar />
        <NavListSettings />
      </>,
    );
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    await expectNoAxeViolations();
  });
});

describe('NavList route matching', () => {
  it('marks only the longest matching prefix and renders its accent indicator', () => {
    const groups: NavGroup[] = [
      {
        items: [
          { label: 'Projects', href: '/projects', match: 'prefix' },
          { label: 'Templates', href: '/projects/templates', match: 'prefix' },
        ],
      },
    ];
    render(<NavList groups={groups} currentHref="/projects/templates/7" />);
    expect(screen.getAllByRole('link', { current: 'page' })).toHaveLength(1);
    const current = screen.getByRole('link', { name: 'Templates' });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.querySelector('[aria-hidden]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Projects' }).querySelector('[aria-hidden]')).toBeNull();
  });

  it.each([
    ['/functions/abc', 'Functions'],
    ['/functions-v2', undefined],
    ['/audit/42', undefined],
    ['/audit', 'Audit'],
    ['/audit?page=2', undefined],
    ['/', 'Home'],
    ['/?tab=a', 'Home'],
  ])('inherits prefix matching with exact overrides at %s', (currentHref, name) => {
    render(
      <NavList
        match="prefix"
        currentHref={currentHref}
        groups={[
          {
            items: [
              { label: 'Functions', href: '/functions' },
              { label: 'Audit', href: '/audit', match: 'exact' },
              { label: 'Home', href: '/' },
            ],
          },
        ]}
      />,
    );
    const current = screen.queryAllByRole('link', { current: 'page' });
    expect(current).toHaveLength(name ? 1 : 0);
    if (name) expect(current[0]).toHaveAccessibleName(name);
  });

  it('explicit true suppresses computed matches and explicit false never matches', () => {
    const { rerender } = render(
      <NavList
        currentHref="/functions/42"
        groups={[
          {
            items: [
              { label: 'Overview', current: true },
              { label: 'Functions', href: '/functions', match: 'prefix' },
            ],
          },
        ]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Functions' })).not.toHaveAttribute('aria-current');
    rerender(
      <NavList
        currentHref="/functions"
        groups={[{ items: [{ label: 'Functions', href: '/functions', current: false }] }]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Functions' })).not.toHaveAttribute('aria-current');
  });

  it('preserves strict exact matching without opt-in', () => {
    render(<NavList currentHref="/audit?page=2" groups={[{ items: [{ label: 'Audit', href: '/audit' }] }]} />);
    expect(screen.getByRole('link', { name: 'Audit' })).not.toHaveAttribute('aria-current');
  });
});

describe('NavList matched sections', () => {
  const groups: NavGroup[] = [
    {
      items: [
        {
          label: 'Storage',
          icon: Settings,
          items: [
            { label: 'Buckets', href: '/storage/buckets', match: 'prefix' },
            { label: 'Bucket detail', href: '/bucket', pattern: ['/archive/:id', '/storage/:id/logs'] },
          ],
        },
      ],
    },
  ];

  it('starts open around the winning descendant and marks only that child', () => {
    render(<NavList groups={groups} currentHref="/storage/buckets/logs" />);
    expect(screen.getByRole('button', { name: 'Storage' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Bucket detail' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Buckets' })).not.toHaveAttribute('aria-current');
  });

  it('keeps a section closed when its prefix descendant loses to another item', () => {
    render(
      <NavList
        groups={[...groups, { items: [{ label: 'Logs', href: '/storage/buckets/logs' }] }]}
        currentHref="/storage/buckets/logs"
      />,
    );
    expect(screen.getByRole('button', { name: 'Storage' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows the rail indicator and marks only the winning flyout child', async () => {
    const user = userEvent.setup();
    render(<NavList groups={groups} currentHref="/storage/buckets/logs" collapsed />);
    const trigger = screen.getByRole('button', { name: 'Storage' });
    expect(trigger.querySelector('span[aria-hidden]')).toBeInTheDocument();
    trigger.focus();
    await user.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Bucket detail' })).toHaveAttribute('aria-current', 'page');
    expect(within(menu).getByRole('menuitem', { name: 'Buckets' })).not.toHaveAttribute('aria-current');
  });

  it('starts open and highlights a rail trigger for a list-wide prefix match', async () => {
    const inherited: NavGroup[] = [
      { items: [{ label: 'Storage', icon: Settings, items: [{ label: 'Buckets', href: '/storage/buckets' }] }] },
    ];
    const { unmount } = render(<NavList groups={inherited} match="prefix" currentHref="/storage/buckets/logs" />);
    expect(screen.getByRole('button', { name: 'Storage' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Buckets' })).toHaveAttribute('aria-current', 'page');
    unmount();
    render(<NavList groups={inherited} match="prefix" currentHref="/storage/buckets/logs" collapsed />);
    const trigger = screen.getByRole('button', { name: 'Storage' });
    expect(trigger.querySelector('span[aria-hidden]')).toBeInTheDocument();
    await userEvent.setup().click(trigger);
    expect(await screen.findByRole('menuitem', { name: 'Buckets' })).toHaveAttribute('aria-current', 'page');
  });
});

it('marks only the first matching item when separate groups share a fallback key', () => {
  render(
    <NavList
      currentHref="/projects/42"
      groups={[
        { label: 'First', items: [{ label: 'Projects', href: '/projects', match: 'prefix' }] },
        { label: 'Second', items: [{ label: 'Other projects', href: '/projects', match: 'prefix' }] },
      ]}
    />,
  );
  expect(screen.getAllByRole('link', { current: 'page' })).toHaveLength(1);
  expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
});

it('marks a pattern-only button child current in the rail flyout', async () => {
  render(
    <NavList
      collapsed
      currentHref="/projects/42"
      groups={[
        {
          items: [
            {
              label: 'Projects',
              icon: Settings,
              items: [{ label: 'Current project', pattern: '/projects/:id' }],
            },
          ],
        },
      ]}
    />,
  );
  await userEvent.setup().click(screen.getByRole('button', { name: 'Projects' }));
  expect(await screen.findByRole('menuitem', { name: 'Current project' })).toHaveAttribute('aria-current', 'page');
});
