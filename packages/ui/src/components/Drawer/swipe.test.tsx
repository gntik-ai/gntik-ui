import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BottomSheet, BottomSheetContent } from '../BottomSheet';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from './Drawer';

// Only browser geometry and hit testing are supplied: the real Base UI gesture
// handlers receive DOM events, and dismissal is observed through the dialog role.
function pointer(element: HTMLElement, type: string, x: number, y: number, time: number) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
  });
  Object.defineProperties(event, {
    pointerId: { value: 1 },
    pointerType: { value: 'mouse' },
    timeStamp: { value: time },
  });
  fireEvent(element, event);
}

it.each(['Drawer', 'BottomSheet'] as const)(
  '%s updates backdrop progress and dismisses past the swipe threshold',
  async (kind) => {
    const hitTest = Object.getOwnPropertyDescriptor(document, 'elementFromPoint');
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
    try {
      render(
        kind === 'Drawer' ? (
          <Drawer defaultOpen>
            <DrawerContent>
              <DrawerTitle>Details</DrawerTitle>
              <DrawerDescription>Project settings</DrawerDescription>
            </DrawerContent>
          </Drawer>
        ) : (
          <BottomSheet defaultOpen snapPoints={[1]}>
            <BottomSheetContent title="Details" description="Project settings" />
          </BottomSheet>
        ),
      );
      const popup = await screen.findByRole('dialog', { name: 'Details' });
      Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => popup });
      const backdrop = popup.parentElement?.previousElementSibling;
      expect(backdrop).toBeInstanceOf(HTMLElement);
      expect(backdrop).toHaveClass('opacity-[calc(1-var(--drawer-swipe-progress,0))]');
      const coordinates = (distance: number): readonly [number, number] =>
        kind === 'Drawer' ? ([distance, 0] as const) : ([0, distance] as const);
      pointer(popup, 'pointerdown', 0, 0, 1000);
      pointer(popup, 'pointermove', 0, 0, 1100);
      pointer(popup, 'pointermove', ...coordinates(50), 2000);
      expect(backdrop).toHaveStyle({ '--drawer-swipe-progress': '0.125' });
      pointer(popup, 'pointerup', ...coordinates(50), 3000);
      expect(popup).not.toHaveAttribute('data-ending-style');
      expect(screen.getByRole('dialog', { name: 'Details' })).toBeInTheDocument();
      pointer(popup, 'pointerdown', 0, 0, 4000);
      pointer(popup, 'pointermove', 0, 0, 4100);
      pointer(popup, 'pointermove', ...coordinates(300), 5000);
      expect(backdrop).toHaveStyle({ '--drawer-swipe-progress': '0.75' });
      pointer(popup, 'pointerup', ...coordinates(300), 6000);
      await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Details' })).not.toBeInTheDocument());
    } finally {
      vi.restoreAllMocks();
      if (hitTest) Object.defineProperty(document, 'elementFromPoint', hitTest);
      else Reflect.deleteProperty(document, 'elementFromPoint');
    }
  },
);
