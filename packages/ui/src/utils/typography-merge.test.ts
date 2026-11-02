import { cn } from './cn';
import { tv } from './tv';

describe('palette typography merging', () => {
  it('keeps emphasis independent of the font family through cn and tv', () => {
    expect(cn('font-mono', 'font-emphasis')).toBe('font-mono font-emphasis');
    expect(cn('font-emphasis', 'font-mono')).toBe('font-emphasis font-mono');
    const variants = tv({ base: 'font-mono', variants: { emphasis: { true: 'font-emphasis' } } });
    expect(variants({ emphasis: true })).toBe('font-mono font-emphasis');
  });

  it('lets explicit emphasis and label case override token utilities in caller order', () => {
    expect(cn('italic', 'font-emphasis')).toBe('font-emphasis');
    expect(cn('font-emphasis', 'not-italic')).toBe('not-italic');
    expect(cn('uppercase', 'label-case')).toBe('label-case');
    expect(cn('label-case', 'normal-case')).toBe('normal-case');
    const variants = tv({ base: 'font-emphasis label-case' });
    expect(variants({ class: 'not-italic normal-case' })).toBe('not-italic normal-case');
  });
});

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
