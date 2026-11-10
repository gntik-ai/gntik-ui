import { selectVariants } from './select.variants';

it.each(['outline', 'filled', 'ghost'] as const)('keeps %s invalid trigger borders through interaction', (variant) => {
  const classes = selectVariants({ variant }).trigger().split(' ');
  for (const state of ['data-invalid', 'aria-invalid']) {
    expect(classes).toContain(`${state}:border-destructive/70`);
    expect(
      classes.some(
        (utility) =>
          utility === `${state}:hover:border-destructive/70` || utility === `hover:${state}:border-destructive/70`,
      ),
    ).toBe(true);
    expect(classes).toContain(`${state}:data-popup-open:border-destructive/70`);
    expect(classes).toContain(`${state}:focus-visible:border-destructive/70`);
  }
  expect(classes).not.toContain('border-destructive/70');
});

it.each(['outline', 'filled', 'ghost'] as const)(
  'styles both %s combobox fields only while invalid',
  async (variant) => {
    const { comboboxVariants } = await import('../Combobox/combobox.variants');
    const slots = comboboxVariants({ variant });
    for (const classes of [slots.inputGroup(), slots.chipsGroup()]) {
      expect(classes.split(' ')).toContain('data-invalid:border-destructive/70');
      expect(classes.split(' ')).toContain('has-[input[aria-invalid=true]]:border-destructive/70');
      expect(classes.split(' ')).toContain('has-[input[data-invalid]]:border-destructive/70');
      expect(classes.split(' ')).not.toContain('border-destructive/70');
    }
  },
);

it('limits the switch destructive ring to invalid controls', async () => {
  const { switchVariants } = await import('../Switch/switch.variants');
  const classes = switchVariants().root().split(' ');
  for (const state of ['data-invalid', 'aria-invalid']) {
    expect(classes).toContain(`${state}:ring-1`);
    expect(classes).toContain(`${state}:ring-destructive/70`);
  }
  expect(classes).not.toContain('ring-1');
  expect(classes).not.toContain('ring-destructive/70');
});

it('limits slider destructive thumb borders to invalid roots', async () => {
  const { sliderVariants } = await import('../Slider/slider.variants');
  const slots = sliderVariants();
  expect(slots.root().split(' ')).toContain('data-invalid:[&_[data-index]]:border-destructive/70');
  expect(slots.root().split(' ')).toContain('aria-invalid:[&_[data-index]]:border-destructive/70');
  expect(slots.thumb().split(' ')).toContain('border-primary');
  expect(slots.thumb().split(' ')).not.toContain('border-destructive/70');
});
