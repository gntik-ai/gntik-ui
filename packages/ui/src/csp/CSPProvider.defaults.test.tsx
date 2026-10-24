import { render, screen } from '@testing-library/react';
import { ScrollArea, SimpleSelect } from '../index';

it('keeps the hoisted scrollbar style without a nonce when ScrollArea and Select have no provider', () => {
  render(
    <>
      <ScrollArea aria-label="Items">Content</ScrollArea>
      <SimpleSelect aria-label="Choice" defaultOpen items={[{ value: 'one', label: 'One' }]} />
    </>,
  );
  expect(screen.getByRole('listbox', { name: 'Choice' })).toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Items' })).toBeInTheDocument();
  expect(document.querySelectorAll('style[data-href="base-ui-disable-scrollbar"]')).toHaveLength(1);
  expect(document.querySelector('style')).not.toHaveAttribute('nonce');
  expect(document.querySelector('[nonce]')).toBeNull();
});
