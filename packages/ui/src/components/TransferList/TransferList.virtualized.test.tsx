import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferList } from './TransferList';

afterEach(() => vi.restoreAllMocks());

it('keeps measured rows adjacent when a transfer shifts item indices', async () => {
  const rect = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const bounds = rect.call(this);
    if (this.getAttribute('role') !== 'option') return bounds;
    const index = Number(this.textContent?.match(/^Item (\d+)/)?.[1]);
    return { ...bounds, height: index % 2 ? 50 : 30 };
  });
  const user = userEvent.setup();
  const items = Array.from({ length: 50 }, (_, i) => ({
    value: `item-${i}`,
    label: `Item ${i}`,
    description: i % 2 ? 'Description' : undefined,
  }));
  render(<TransferList items={items} virtualized />);
  const available = screen.getByRole('listbox', { name: 'Available' });
  const option = (name: string) => within(available).getByRole('option', { name });
  expect(option('Item 0')).toHaveStyle({ transform: 'translateY(0px)' });
  expect(option('Item 1Description')).toHaveStyle({ transform: 'translateY(30px)' });
  expect(option('Item 2')).toHaveStyle({ transform: 'translateY(80px)' });

  await user.click(option('Item 0'));
  await user.click(screen.getByRole('button', { name: 'Add checked' }));

  expect(option('Item 1Description')).toHaveStyle({ transform: 'translateY(0px)' });
  expect(option('Item 2')).toHaveStyle({ transform: 'translateY(50px)' });
  expect(option('Item 3Description')).toHaveStyle({ transform: 'translateY(80px)' });

  await user.type(screen.getByRole('searchbox', { name: 'Search available' }), 'Description');
  expect(option('Item 1Description')).toHaveStyle({ transform: 'translateY(0px)' });
  expect(option('Item 3Description')).toHaveStyle({ transform: 'translateY(50px)' });
  expect(option('Item 5Description')).toHaveStyle({ transform: 'translateY(100px)' });
});

it('keeps non-virtualized options as direct children of each listbox', () => {
  render(
    <TransferList
      items={[
        { value: 'a', label: 'Alpha' },
        { value: 'b', label: 'Bravo' },
      ]}
      defaultValue={['b']}
    />,
  );
  for (const list of screen.getAllByRole('listbox')) {
    for (const option of within(list).getAllByRole('option')) expect(option.parentElement).toBe(list);
  }
});
