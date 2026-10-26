import { cn } from './cn';

it('lets consumers override token cursors with any cursor utility', () => {
  expect(cn('cursor-interactive', 'cursor-grab')).toBe('cursor-grab');
  expect(cn('cursor-disabled', 'cursor-interactive')).toBe('cursor-interactive');
  expect(cn('cursor-grab', 'cursor-disabled')).toBe('cursor-disabled');
  expect(cn('data-[disabled]:cursor-disabled', 'data-[disabled]:cursor-default')).toBe(
    'data-[disabled]:cursor-default',
  );
});
