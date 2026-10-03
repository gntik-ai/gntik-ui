import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DocsLayout } from './DocsLayout';
import DocsLayoutGuide from './examples/DocsLayoutGuide';
import { Outline } from './Outline';

const toc = () => screen.getByRole('navigation', { name: 'On this page' });

describe('DocsLayout', () => {
  it('renders header, nav, article and a labelled table of contents', () => {
    const { container } = render(<DocsLayoutGuide />);
    expect(container.querySelector('.h-full')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Documentation' })).toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByRole('article')).toHaveTextContent('Deploy a project');
    const links = within(toc()).getAllByRole('link');
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute('aria-current', 'location');
  });

  it('a table of contents link moves focus to its heading and becomes current', async () => {
    const user = userEvent.setup();
    render(<DocsLayoutGuide />);
    const link = within(toc()).getByRole('link', { name: 'Configure the project' });
    link.focus();
    await user.keyboard('{Enter}');
    const heading = screen.getByRole('heading', { name: 'Configure the project' });
    expect(heading).toHaveFocus();
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(link).toHaveAttribute('aria-current', 'location');
  });

  it('Tab reaches the table of contents after the article', async () => {
    const user = userEvent.setup();
    render(
      <DocsLayout toc={[{ id: 'a', label: 'Alpha' }]}>
        <h2 id="a">Alpha</h2>
      </DocsLayout>,
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'On this page' })).toHaveFocus();
    await user.tab();
    expect(within(toc()).getByRole('link', { name: 'Alpha' })).toHaveFocus();
  });

  it('small screens: the Collapsible toggles the table of contents', async () => {
    const user = userEvent.setup();
    render(<DocsLayoutGuide />);
    const trigger = screen.getByRole('button', { name: 'On this page' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Two copies of the entries now: the Collapsible one is not a second landmark.
    expect(screen.getAllByRole('link', { name: 'Ship it' })).toHaveLength(2);
    expect(screen.getAllByRole('navigation', { name: 'On this page' })).toHaveLength(1);
    await expectNoAxeViolations();
  });

  it('scroll-spy marks the first heading in view (IntersectionObserver)', () => {
    let callback: IntersectionObserverCallback = () => {};
    const observe = vi.fn();
    class FakeObserver {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe = observe;
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal('IntersectionObserver', FakeObserver);
    const onActiveChange = vi.fn();
    render(
      <>
        <h2 id="one">One</h2>
        <h2 id="two">Two</h2>
        <Outline items={[{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }]} onActiveChange={onActiveChange} />
      </>,
    );
    expect(observe).toHaveBeenCalledTimes(2);
    act(() => callback([{ target: document.getElementById('two'), isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(screen.getByRole('link', { name: 'Two' })).toHaveAttribute('aria-current', 'location');
    expect(onActiveChange).toHaveBeenCalledWith('two');
    vi.unstubAllGlobals();
  });

  it('the example has no axe violations', async () => {
    render(<DocsLayoutGuide />);
    await expectNoAxeViolations();
  });
});
