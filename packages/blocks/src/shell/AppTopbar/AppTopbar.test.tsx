import { ThemeProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { AppTopbar } from './AppTopbar';

describe('AppTopbar', () => {
  it('renders breadcrumb, environment, search, notifications, theme and user', async () => {
    const { container } = render(
      <ThemeProvider storageKey={null}>
        <AppTopbar />
      </ThemeProvider>,
    );
    const crumbs = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(within(crumbs).getByText('web-frontend')).toBeInTheDocument();
    expect(container.querySelector('[data-environment="production"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Search/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  }, 15_000);

  it('opens the notifications and selects one', async () => {
    const user = userEvent.setup();
    const onNotificationSelect = vi.fn();
    render(
      <ThemeProvider storageKey={null}>
        <AppTopbar onNotificationSelect={onNotificationSelect} search={null} theme="segmented" />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: /notifications/i }));
    await user.click(await screen.findByText('api-gateway reached 97% of its monthly budget'));
    expect(onNotificationSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'n1' }));
  });

  it('hides optional parts with null', () => {
    const { container } = render(<AppTopbar breadcrumbs={null} environment={null} search={null} notifications={null} theme={null} user={null} />);
    expect(container.querySelectorAll('button')).toHaveLength(0);
  });
});
