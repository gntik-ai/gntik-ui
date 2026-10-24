import { render, screen } from '@testing-library/react';
import { CSPProvider, ScrollArea, SimpleSelect } from '../index';

// Isolated from nonce tests: React caches resource styles by href for the whole document.
// A fresh document ensures style suppression cannot pass because a prior render deduplicated it.
it('omits scrollbar styles while retaining static scrollbar hiding on every affected slot', () => {
  render(
    <CSPProvider disableStyleElements>
      <ScrollArea aria-label="Items">Content</ScrollArea>
      <SimpleSelect aria-label="Choice" defaultOpen items={[{ value: 'one', label: 'One' }]} />
    </CSPProvider>,
  );
  expect(document.querySelector('style')).toBeNull();
  expect(screen.getByRole('region', { name: 'Items' })).toHaveClass(
    '[scrollbar-width:none]',
    '[&::-webkit-scrollbar]:hidden',
  );
  const list = screen.getByRole('listbox', { name: 'Choice' });
  expect(list).toHaveClass('[scrollbar-width:none]', '[&::-webkit-scrollbar]:hidden');
  expect(list.parentElement).toHaveClass('[scrollbar-width:none]', '[&::-webkit-scrollbar]:hidden');
});
