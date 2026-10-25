import { cn } from './cn';
import { tv } from './tv';

const roles = [
  'display',
  'heading-xl',
  'heading-lg',
  'heading-md',
  'heading-sm',
  'heading-xs',
  'heading-2xs',
  'body',
  'label',
  'supporting',
  'caption',
];

describe.each(roles)('text-%s merging', (role) => {
  const utility = `text-${role}`;
  it('retains the size alongside a colour through cn and tv', () => {
    expect(cn(utility, 'text-foreground')).toBe(`${utility} text-foreground`);
    expect(cn('text-foreground', utility)).toBe(`text-foreground ${utility}`);
    const variants = tv({ base: utility, variants: { tone: { default: 'text-foreground' } } });
    expect(variants({ tone: 'default' })).toBe(`${utility} text-foreground`);
  });
  it('resolves literal and role font sizes in caller order', () => {
    expect(cn('text-[13px]', utility)).toBe(utility);
    expect(cn(utility, 'text-[13px]')).toBe('text-[13px]');
    expect(cn(utility, 'font-bold', 'leading-tight', 'tracking-normal')).toBe(
      `${utility} font-bold leading-tight tracking-normal`,
    );
  });
});
