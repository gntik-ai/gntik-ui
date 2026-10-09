import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../test/a11y';
import PublicHubPage from './Page';

// Public seam: the rendered page's content order and accessible document outline.
const full = {
  eyebrow: 'Start here',
  title: 'Welcome',
  description: 'Choose how to continue.',
  cards: [
    { title: 'Your workspace', body: 'Keep your work together.' },
    { title: 'Your team', body: 'Collaborate with others.' },
  ],
  primaryAction: { label: 'Sign in', href: '#sign-in' },
  secondaryAction: { label: 'Create an account', href: '#sign-up' },
  tertiaryLink: { label: 'Recover access', href: '#recovery' },
  footer: 'Contact support for help.',
};

describe('PublicHubPage', () => {
  it('renders the full hub in reading order with a single labelled page heading', () => {
    const { container } = render(<PublicHubPage {...full} />);
    const heading = screen.getByRole('heading', { level: 1, name: full.title });
    const region = screen.getByRole('region', { name: full.title });
    expect(heading.id).not.toBe('');
    expect(region).toHaveAttribute('aria-labelledby', heading.id);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(
      within(region)
        .getAllByRole('heading', { level: 2 })
        .map((h) => h.textContent),
    ).toEqual(['Your workspace', 'Your team']);
    const list = within(region).getByRole('list');
    expect(list.tagName).toBe('UL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(list).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    const ordered = [
      screen.getByText(full.eyebrow),
      heading,
      screen.getByText(full.description),
      list,
      screen.getByRole('link', { name: 'Sign in' }),
      screen.getByRole('link', { name: 'Create an account' }),
      screen.getByRole('link', { name: 'Recover access' }),
      screen.getByRole('separator'),
      screen.getByText(full.footer),
    ];
    ordered.slice(1).forEach((element, index) => {
      expect(ordered[index]!.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    expect(region.querySelectorAll('header')).toHaveLength(1);
    expect(within(region).queryByRole('navigation')).not.toBeInTheDocument();
    expect(within(region).queryByRole('tablist')).not.toBeInTheDocument();
    expect(region.querySelector('dl')).toBeNull();
    expect(region.textContent).toBe('Start hereWelcomeChoose how to continue.Your workspaceKeep your work together.Your teamCollaborate with others.Sign inCreate an accountRecover accessContact support for help.');
    expect(within(region).queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('[class*="bg-chrome"]')).toBeInTheDocument();
    expect(screen.getByRole('main').parentElement).toHaveClass('h-dvh');
    expect(container.querySelector('img')).toBeNull();
  });

  it('replaces the full content with decorative kit skeletons in a named busy region', () => {
    const { rerender } = render(<PublicHubPage {...full} loading />);
    const region = screen.getByRole('region', { name: 'Loading' });
    expect(region).toHaveAttribute('aria-busy', 'true');
    expect(region).not.toHaveAttribute('aria-labelledby');
    expect(within(region).queryByRole('heading')).not.toBeInTheDocument();
    expect(within(region).queryByRole('link')).not.toBeInTheDocument();
    expect(within(region).queryByRole('separator')).not.toBeInTheDocument();
    expect(within(region).queryByText(full.eyebrow)).not.toBeInTheDocument();
    expect(within(region).queryByText(full.footer)).not.toBeInTheDocument();
    expect(region.querySelectorAll('[aria-hidden="true"]')).toHaveLength(8);
    rerender(<PublicHubPage loading loadingLabel="Loading account access" />);
    const minimal = screen.getByRole('region', {
      name: 'Loading account access',
    });
    expect(minimal.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
    expect(within(minimal).queryByRole('list')).not.toBeInTheDocument();
    rerender(<PublicHubPage {...full} />);
    expect(screen.getByRole('region', { name: full.title })).not.toHaveAttribute('aria-busy');
  });

  for (const optional of ['eyebrow', 'description', 'cards', 'secondaryAction', 'tertiaryLink', 'footer'] as const) {
    it(`omits ${optional} without an empty replacement`, () => {
      render(<PublicHubPage {...full} {...{ [optional]: undefined }} />);
      const region = screen.getByRole('region', { name: full.title });
      if (optional === 'cards') {
        expect(within(region).queryByRole('list')).not.toBeInTheDocument();
        expect(within(region).queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
      } else if (optional === 'secondaryAction' || optional === 'tertiaryLink') {
        expect(within(region).queryByRole('link', { name: full[optional].label })).not.toBeInTheDocument();
      } else {
        expect(within(region).queryByText(full[optional])).not.toBeInTheDocument();
      }
      if (optional === 'footer') expect(within(region).queryByRole('separator')).not.toBeInTheDocument();
      const emptyWrappers = [...region.querySelectorAll('div:empty, ul:empty, li:empty')].filter((element) => element.getAttribute('role') !== 'separator');
      expect(emptyWrappers).toHaveLength(0);
    });
  }

  it('renders the minimal fixture and no list for an empty card array', () => {
    render(<PublicHubPage cards={[]} logo={<span>Example mark</span>} />);
    const region = screen.getByRole('region', { name: 'Welcome' });
    expect(within(region).getAllByRole('link')).toHaveLength(1);
    expect(within(region).queryByRole('list')).not.toBeInTheDocument();
    expect(within(region).queryByRole('separator')).not.toBeInTheDocument();
    expect(region.querySelectorAll('div:empty, ul:empty, li:empty')).toHaveLength(0);
    expect(screen.getByText('Example mark')).toBeInTheDocument();
  });

  it('tabs through navigation links in order, activates each with Enter, and leaves the page', async () => {
    const user = userEvent.setup();
    const actions = [full.primaryAction, full.secondaryAction, full.tertiaryLink].map((action) => ({
      ...action,
      onClick: vi.fn((event) => event.preventDefault()),
    }));
    render(
      <>
        <PublicHubPage {...full} primaryAction={actions[0]} secondaryAction={actions[1]} tertiaryLink={actions[2]} />
        <a href="#after">After hub</a>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to sign-in form' })).toHaveFocus();
    for (const action of actions) {
      await user.tab();
      const link = screen.getByRole('link', { name: action.label });
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', action.href);
      expect(link).toHaveFocus();
      expect(link).toHaveClass('focus-visible:outline-focus-ring');
      await user.keyboard('{Enter}');
      expect(action.onClick).toHaveBeenCalledOnce();
    }
    await user.tab();
    expect(screen.getByRole('link', { name: 'After hub' })).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole('link', { name: 'Recover access' })).toHaveFocus();
  });
});

// Theme × fixture × loading matrix exercises the real composition, with no kit mocks.
for (const theme of ['dark', 'light', 'high_contrast'] as const) {
  for (const fixture of ['full', 'minimal'] as const) {
    for (const loading of [false, true]) {
      it(`axe: ${theme} / ${fixture} / loading=${loading}`, async () => {
        const { container } = render(
          <ThemeProvider defaultMode={theme} storageKey={null}>
            <PublicHubPage {...(fixture === 'full' ? full : {})} loading={loading} />
          </ThemeProvider>,
        );
        await expectNoAxeViolations(container);
      });
    }
  }
}
