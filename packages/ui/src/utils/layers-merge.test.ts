import { cn } from './cn';
import { tv } from './tv';

it('resolves named stacking utilities by the last caller override', () => {
  expect(cn('sticky z-raised bg-card', 'z-sticky-pinned')).toBe('sticky bg-card z-sticky-pinned');
  expect(cn('z-modal', 'z-base')).toBe('z-base');
  expect(cn('z-raised', 'z-auto')).toBe('z-auto');
  expect(cn('z-raised', 'z-0')).toBe('z-0');
  expect(cn('focus:z-raised', 'focus:z-sticky')).toBe('focus:z-sticky');
  const variants = tv({ base: 'relative z-raised', variants: { pinned: { true: 'z-sticky-pinned' } } });
  expect(variants({ pinned: true })).toBe('relative z-sticky-pinned');
});
