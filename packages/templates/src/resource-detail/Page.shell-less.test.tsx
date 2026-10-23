import { render, screen, within } from '@testing-library/react';
import ResourceDetailPage from './Page';
import { expectNoAxeViolations } from '../test/a11y';

it('renders only page content and the default breadcrumb navigation without a shell', () => {
  render(<ResourceDetailPage shell={null} />);
  for (const role of ['complementary', 'banner', 'main']) {
    expect(screen.queryByRole(role)).not.toBeInTheDocument();
  }
  expect(screen.getAllByRole('navigation')).toHaveLength(1);
  expect(screen.getByRole('heading', { level: 1 })).toBeVisible();
  expect(screen.getByRole('tablist', { name: 'Resource sections' })).toBeVisible();
});

it('shows explicit breadcrumbs and omits navigation for an empty trail', () => {
  const { rerender } = render(
    <ResourceDetailPage shell={null} breadcrumbs={[{ label: 'Ops', href: '/ops' }, { label: 'Op 1' }]} />,
  );
  const nav = screen.getByRole('navigation');
  expect(within(nav).getByRole('link', { name: 'Ops' })).toHaveAttribute('href', '/ops');
  expect(within(nav).getByText('Op 1')).toBeVisible();
  rerender(<ResourceDetailPage shell={null} breadcrumbs={[]} />);
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  rerender(<ResourceDetailPage shell={null} readOnly name="Resource record" />);
  expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
});

it('fits accessibly inside the host main landmark', { timeout: 15000 }, async () => {
  const { container } = render(
    <main>
      <ResourceDetailPage shell={null} />
    </main>,
  );
  expect(screen.getAllByRole('main')).toHaveLength(1);
  await expectNoAxeViolations(container);
});
