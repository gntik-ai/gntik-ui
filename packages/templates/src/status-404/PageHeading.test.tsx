import { PageHeader } from '@gntik-ai/blocks';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../test/a11y';
import Status404Page from './Page';

it('uses PageHeader as the sole h1 while preserving the 404 content, actions and focus contract', async () => {
  const user = userEvent.setup();
  const onBack = vi.fn();
  const titleRef = createRef<HTMLHeadingElement>();
  render(
    <Status404Page
      homeHref="/dashboard"
      onBack={onBack}
      heading={<PageHeader as="div" title="Page not found" titleRef={titleRef} breadcrumbs={null} description={null} status="" meta={[]} tabs={null} actions={[]} />}
    />,
  );
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  const heading = screen.getByRole('heading', { level: 1, name: 'Page not found' });
  expect(screen.queryByText('We can’t find that page')).not.toBeInTheDocument();
  expect(screen.getByText('404 · Not found')).toBeInTheDocument();
  expect(screen.getByText('The page may have been moved or deleted, or the link is out of date. Check the address or head back to the dashboard.')).toBeInTheDocument();
  const primary = screen.getByRole('button', { name: 'Go to dashboard' });
  expect(primary).toHaveAttribute('href', '/dashboard');
  expect(screen.getByRole('main').querySelector('a[href], button, [tabindex="0"]')).toBe(primary);
  expect(screen.getByRole('link', { name: 'Contact support' })).toHaveAttribute('href', '/support');
  await user.tab();
  await user.tab();
  expect(primary).toHaveFocus();
  titleRef.current?.focus();
  expect(heading).toHaveFocus();
  await user.click(screen.getByRole('button', { name: 'Go back' }));
  expect(onBack).toHaveBeenCalledOnce();
  await expectNoAxeViolations();
});
