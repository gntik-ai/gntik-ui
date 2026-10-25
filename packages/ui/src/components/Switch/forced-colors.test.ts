import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { render } from '@testing-library/react';
import { Progress } from '../Progress/Progress';
import { Meter } from '../Meter/Meter';
import { cn } from '../../utils/cn';
import { switchVariants } from '../Switch/switch.variants';
import { radioGroupVariants } from '../RadioGroup/radio-group.variants';
import { tabsVariants } from '../Tabs/tabs.variants';
import { progressVariants } from '../Progress/progress.variants';
import { meterVariants } from '../Meter/meter.variants';
import { sliderVariants } from '../Slider/slider.variants';
import { separatorVariants } from '../Separator/separator.variants';
import { statusDotVariants } from '../StatusDot/status-dot.variants';
import { tableVariants } from '../Table/table.variants';
import { toggleVariants } from '../ToggleGroup/toggle-group.variants';
import { calendarVariants } from '../Calendar/calendar.variants';
import { selectVariants } from '../Select/select.variants';
import { menuVariants } from '../Menu/menu.variants';
import { comboboxVariants } from '../Combobox/combobox.variants';
import { commandPaletteVariants } from '../CommandPalette/command-palette.variants';
import { virtualListVariants } from '../VirtualList/virtual-list.variants';
import { transferListVariants } from '../TransferList/transfer-list.variants';

const ordinaryClasses = (value = '') =>
  value
    .split(' ')
    .filter((c) => !c.startsWith('forced-colors:'))
    .join(' ');
const hasClasses = (value: string, classes: string[]) => {
  const merged = cn(value, 'bg-card text-foreground border-border');
  for (const expected of classes) expect(merged.split(' ')).toContain(expected);
};

describe('forced colours', () => {
  it('preserves the base non-forced output at the public variants seam', () => {
    const cases = [
      ['Switch', switchVariants()],
      ['RadioGroup', radioGroupVariants()],
      ['Tabs', tabsVariants()],
      ['Progress', progressVariants()],
      ['Meter', meterVariants()],
      ['Slider', sliderVariants()],
      ['Separator', separatorVariants()],
      ['StatusDot', statusDotVariants()],
      ['Table', tableVariants()],
      ['ToggleGroup', toggleVariants()],
      ['Calendar', calendarVariants()],
      ['Select', selectVariants()],
      ['Menu', menuVariants()],
      ['Combobox', comboboxVariants()],
      ['CommandPalette', commandPaletteVariants()],
      ['VirtualList', virtualListVariants()],
      ['TransferList', transferListVariants()],
      ["Switch { size: 'sm' }", switchVariants({ size: 'sm' })],
      ["Switch { size: 'lg' }", switchVariants({ size: 'lg' })],
      ["RadioGroup { variant: 'card' }", radioGroupVariants({ variant: 'card' })],
      ["RadioGroup { variant: 'list' }", radioGroupVariants({ variant: 'list' })],
      ["Tabs { variant: 'pills' }", tabsVariants({ variant: 'pills' })],
      ['Tabs { indicator: false }', tabsVariants({ indicator: false })],
      ["Tabs { variant: 'pills', indicator: false }", tabsVariants({ variant: 'pills', indicator: false })],
      ['Menu { destructive: true }', menuVariants({ destructive: true })],
    ] as const;
    for (const [name, slots] of cases) {
      const output =
        typeof slots === 'string'
          ? ordinaryClasses(slots)
          : Object.fromEntries(Object.entries(slots).map(([slot, classes]) => [slot, ordinaryClasses(classes())]));
      expect(output, name).toMatchSnapshot(name);
    }
  });

  it('keeps switch track and thumb states visible, including after consumer merging', () => {
    const s = switchVariants();
    hasClasses(cn(s.root(), 'bg-card'), [
      'forced-colors:bg-[Canvas]',
      'forced-colors:outline',
      'forced-colors:-outline-offset-1',
      'forced-colors:outline-[ButtonBorder]',
      'forced-colors:data-checked:bg-[Highlight]',
      'forced-colors:data-disabled:outline-[GrayText]',
    ]);
    hasClasses(s.thumb({ class: 'bg-card' }), [
      'forced-colors:bg-[ButtonText]',
      'forced-colors:data-checked:bg-[HighlightText]',
      'forced-colors:data-disabled:bg-[GrayText]',
    ]);
  });
  it('keeps the checked radio dot and card border visible', () => {
    const s = radioGroupVariants({ variant: 'card' });
    hasClasses(s.radio(), [
      'forced-colors:data-checked:bg-[Highlight]',
      'forced-colors:data-checked:border-[Highlight]',
      'forced-colors:data-disabled:border-[GrayText]',
    ]);
    hasClasses(s.indicator(), ['forced-colors:bg-[HighlightText]', 'forced-colors:data-disabled:bg-[GrayText]']);
    hasClasses(s.item(), [
      'forced-colors:has-[[data-checked]]:border-2',
      'forced-colors:has-[[data-checked]]:border-[Highlight]',
    ]);
  });

  it.each(['underline', 'pills'] as const)(
    'marks only the active %s tab, with sliding or static indicators',
    (variant) => {
      const sliding = tabsVariants({ variant });
      const fixed = tabsVariants({ variant, indicator: false });
      if (variant === 'underline') {
        hasClasses(sliding.indicator(), ['forced-colors:bg-[Highlight]']);
        hasClasses(sliding.tab(), ['forced-colors:border-[Canvas]', 'forced-colors:data-active:border-[Highlight]']);
        hasClasses(fixed.tab(), ['forced-colors:data-active:border-[Highlight]']);
      } else {
        hasClasses(sliding.indicator(), ['forced-colors:border-2', 'forced-colors:border-[Highlight]']);
        hasClasses(fixed.tab(), ['forced-colors:data-active:border-2', 'forced-colors:data-active:border-[Highlight]']);
      }
    },
  );

  it('outlines the Progress track and paints its fill', () => {
    const s = progressVariants();
    hasClasses(s.track(), [
      'forced-colors:outline',
      'forced-colors:-outline-offset-1',
      'forced-colors:outline-[CanvasText]',
    ]);
    hasClasses(s.indicator(), ['forced-colors:bg-[Highlight]']);
  });

  it('outlines the Meter track and paints its fill', () => {
    const s = meterVariants();
    hasClasses(s.track(), [
      'forced-colors:outline',
      'forced-colors:-outline-offset-1',
      'forced-colors:outline-[CanvasText]',
    ]);
    hasClasses(s.indicator(), ['forced-colors:bg-[Highlight]']);
  });

  it('outlines the Slider track and paints its fill', () => {
    const s = sliderVariants();
    hasClasses(s.track(), [
      'forced-colors:outline',
      'forced-colors:-outline-offset-1',
      'forced-colors:outline-[CanvasText]',
    ]);
    hasClasses(s.indicator(), ['forced-colors:bg-[Highlight]']);
  });

  it('keeps separator lines visible', () => {
    hasClasses(separatorVariants().line(), ['forced-colors:bg-[CanvasText]']);
  });

  it('keeps status dots visible and hides their ping', () => {
    const s = statusDotVariants();
    hasClasses(s.dot(), ['forced-colors:bg-[CanvasText]']);
    hasClasses(s.ping(), ['forced-colors:hidden']);
  });

  it('uses system selection colours for Table', () => {
    hasClasses(tableVariants().row(), [
      'forced-colors:data-[selected]:bg-[Highlight]',
      'forced-colors:data-[selected]:text-[HighlightText]',
    ]);
  });

  it('uses system selection colours for ToggleGroup', () => {
    hasClasses(toggleVariants(), [
      'forced-colors:data-pressed:bg-[Highlight]',
      'forced-colors:data-pressed:text-[HighlightText]',
    ]);
  });

  it('uses system selection colours for Calendar', () => {
    hasClasses(calendarVariants().day(), [
      'forced-colors:data-selected:bg-[Highlight]',
      'forced-colors:data-selected:text-[HighlightText]',
    ]);
  });

  it('uses system selection colours for Select', () => {
    hasClasses(comboboxVariants().item(), [
      'forced-colors:data-highlighted:bg-[Highlight]',
      'forced-colors:data-highlighted:text-[HighlightText]',
    ]);
    hasClasses(selectVariants().item(), [
      'forced-colors:data-highlighted:bg-[Highlight]',
      'forced-colors:data-highlighted:text-[HighlightText]',
    ]);
  });

  it('uses system selection colours for Menu', () => {
    hasClasses(menuVariants().item(), [
      'forced-colors:data-highlighted:bg-[Highlight]',
      'forced-colors:data-highlighted:text-[HighlightText]',
    ]);
  });

  it('uses system selection colours for CommandPalette', () => {
    hasClasses(commandPaletteVariants().item(), [
      'forced-colors:data-highlighted:bg-[Highlight]',
      'forced-colors:data-highlighted:text-[HighlightText]',
      'forced-colors:data-highlighted:[&&_*]:text-[HighlightText]',
    ]);
  });

  it('uses system selection colours for VirtualList', () => {
    hasClasses(virtualListVariants().option(), [
      'forced-colors:data-active:bg-[Highlight]',
      'forced-colors:data-active:text-[HighlightText]',
    ]);
  });

  it('uses system selection colours for TransferList', () => {
    hasClasses(transferListVariants().option(), [
      'forced-colors:data-active:bg-[Highlight]',
      'forced-colors:data-active:text-[HighlightText]',
    ]);
  });
  it('retains sixty-percent values and fills at the rendered component seam', () => {
    const { getByRole } = render(
      createElement(
        'div',
        null,
        createElement(Progress, { value: 60, 'aria-label': 'Progress' }),
        createElement(Meter, { value: 60, 'aria-label': 'Meter' }),
      ),
    );
    for (const role of ['progressbar', 'meter']) {
      const control = getByRole(role);
      expect(control).toHaveAttribute('aria-valuenow', '60');
      const fill = control.querySelector('[class*="forced-colors:bg-"]');
      expect(fill).toHaveStyle({ width: '60%' });
      expect(fill).toHaveClass('forced-colors:bg-[Highlight]');
      expect(fill?.parentElement).toHaveClass('forced-colors:outline-[CanvasText]');
    }
  });
});
