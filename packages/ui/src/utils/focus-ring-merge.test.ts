import { cn } from './cn';
import { tv } from './tv';

it('keeps one shared focus utility at the last caller position through cn and tv', () => {
  expect(cn('focus-ring text-foreground', 'px-2 focus-ring')).toBe('text-foreground px-2 focus-ring');
  const variants = tv({ base: 'focus-ring text-foreground' });
  expect(variants({ className: 'px-2 focus-ring' })).toBe('text-foreground px-2 focus-ring');
});

it('lets callers choose an inset outline without dropping unrelated or explicit state classes', () => {
  expect(cn('outline-none focus-ring', 'focus-ring-inset')).toBe('outline-none focus-ring-inset');
  expect(cn('focus-ring-inset', 'focus-ring')).toBe('focus-ring');
  expect(cn('focus-ring', 'focus-visible:outline-none')).toBe('focus-ring focus-visible:outline-none');
  const variants = tv({ base: 'focus-ring' });
  expect(variants({ className: 'focus-ring-inset' })).toBe('focus-ring-inset');
});
