import { describe, expect, it } from 'vitest';
import { dialogVariants } from './dialog.variants';
import { drawerVariants } from '../Drawer/drawer.variants';
import { bottomSheetVariants } from '../BottomSheet/bottom-sheet.variants';
import { commandPaletteVariants } from '../CommandPalette/command-palette.variants';
import { lightboxVariants } from '../Lightbox/lightbox.variants';

describe('overlay backdrop positioning', () => {
  it.each([
    ['Dialog / AlertDialog', dialogVariants],
    ['Drawer', drawerVariants],
    ['BottomSheet', bottomSheetVariants],
    ['CommandPalette', commandPaletteVariants],
    ['Lightbox', lightboxVariants],
  ] as const)('%s allows the opt-in Safari position with a fixed fallback', (_name, variants) => {
    const classes = variants().backdrop().split(' ');
    expect(classes).toContain('[position:var(--backdrop-position,fixed)]');
    expect(classes).toContain('min-h-dvh');
    expect(classes).toContain('inset-0');
    expect(classes).not.toContain('fixed');
  });

  it('keeps overlay viewports and the Lightbox popup fixed', () => {
    for (const variants of [dialogVariants, drawerVariants, bottomSheetVariants, commandPaletteVariants]) {
      expect(variants().viewport().split(' ')).toEqual(expect.arrayContaining(['fixed', 'inset-0']));
    }
    expect(lightboxVariants().popup().split(' ')).toEqual(expect.arrayContaining(['fixed', 'inset-0']));
  });
});
