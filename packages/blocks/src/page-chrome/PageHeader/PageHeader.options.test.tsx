import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { PageHeader } from './PageHeader';

it('wraps long titles while preserving titleRef focus and the default class string', async () => {
  const title = 'x'.repeat(120);
  const titleRef = createRef<HTMLHeadingElement>();
  const props = { title, titleRef, breadcrumbs: null, tabs: null, meta: [], actions: [] };
  const { container, rerender } = render(
    <>
      <PageHeader {...props} wrapTitle />
      <button>Continue</button>
    </>,
  );
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).not.toHaveClass('truncate');
  expect(heading).toHaveClass('min-w-0', 'wrap-anywhere');
  expect(heading.textContent).toBe(title);
  expect(titleRef.current).toBe(heading);
  expect(heading).toHaveAttribute('tabindex', '-1');
  await userEvent.setup().tab();
  expect(screen.getByRole('button', { name: 'Continue' })).toHaveFocus();
  titleRef.current?.focus();
  expect(heading).toHaveFocus();
  await expectNoAxeViolations(container);
  rerender(<PageHeader {...props} />);
  expect(screen.getByRole('heading', { level: 1 }).className).toBe(
    'min-w-0 truncate text-2xl font-bold tracking-tight text-foreground',
  );
  rerender(<PageHeader {...props} titleRef={undefined} wrapTitle />);
  expect(screen.getByRole('heading', { level: 1 })).not.toHaveAttribute('tabindex');
});
