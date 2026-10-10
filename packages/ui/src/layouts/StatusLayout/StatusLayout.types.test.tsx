import { render, screen } from '@testing-library/react';
import { StatusLayout, type StatusLayoutProps } from './StatusLayout';

it('accepts existing title props and heading-only props at the public type boundary', () => {
  const title: StatusLayoutProps = { title: 'Not found' };
  const heading: StatusLayoutProps = { heading: <h1>Not found</h1> };
  const emptySlot: StatusLayoutProps = { title: 'Not found', heading: null };
  // @ts-expect-error A page must supply a title or a heading.
  const missing: StatusLayoutProps = {};
  // @ts-expect-error The slot replaces the built-in title.
  const duplicate: StatusLayoutProps = { title: 'Not found', heading: <h1>Not found</h1> };
  // @ts-expect-error An empty slot still needs the built-in title.
  const empty: StatusLayoutProps = { heading: null };
  void [missing, duplicate, empty];
  const { rerender } = render(<StatusLayout {...title} />);
  expect(screen.getByRole('heading', { level: 1, name: 'Not found' })).toBeInTheDocument();
  rerender(<StatusLayout {...heading} />);
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  rerender(<StatusLayout {...emptySlot} />);
  expect(screen.getByRole('heading', { level: 1, name: 'Not found' })).toBeInTheDocument();
});
