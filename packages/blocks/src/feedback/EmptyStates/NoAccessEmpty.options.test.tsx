import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { FirstRunEmpty, NoAccessEmpty } from './EmptyStates';

it.each([false, true])('omits all actions and status when hidden (defaultRequested=%s)', async (defaultRequested) => {
  const { container } = render(<NoAccessEmpty showRequestAccess={false} defaultRequested={defaultRequested} />);
  expect(screen.queryByRole('button')).toBeNull();
  expect(screen.queryByRole('link')).toBeNull();
  expect(screen.queryByRole('status')).toBeNull();
  expect(container.querySelector('h3 + p + div')).toBeNull();
  expect(container).not.toHaveTextContent('Access request sent');
  await expectNoAxeViolations(container);
});

it.each([false, true])(
  'offers one href action in the right position (showRequestAccess=%s)',
  async (showRequestAccess) => {
    const action = { label: 'Volver al resumen', href: '/x' };
    const { container, rerender } = render(<FirstRunEmpty secondary={action} />);
    const referenceClassName = screen.getByRole('link', { name: action.label }).className;
    rerender(<NoAccessEmpty action={action} showRequestAccess={showRequestAccess} />);
    const link = screen.getByRole('link', { name: action.label });
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(link).toHaveAttribute('href', '/x');
    expect(link.className).toBe(referenceClassName);
    expect(link.parentElement?.parentElement).toBe(container.firstElementChild);
    if (showRequestAccess) {
      const button = screen.getByRole('button', { name: 'Request access' });
      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(Array.from(link.parentElement!.children)).toEqual([button, link]);
    } else {
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.queryByRole('status')).toBeNull();
      expect(Array.from(link.parentElement!.children)).toEqual([link]);
    }
    await expectNoAxeViolations(container);
  },
);
