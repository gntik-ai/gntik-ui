import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';
import { FormDialog } from './FormDialog';

// Only browser geometry and hit testing are supplied; Base UI's real gesture handlers get DOM events.
function pointer(element: HTMLElement, type: string, x: number, time: number) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: 0,
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

function swipePastThreshold(popup: HTMLElement, start: number) {
  pointer(popup, 'pointerdown', 0, start);
  pointer(popup, 'pointermove', 0, start + 100);
  pointer(popup, 'pointermove', 300, start + 1000);
  pointer(popup, 'pointerup', 300, start + 2000);
}

it('a drawer swipe does nothing while a submit is pending', async () => {
  const hitTest = Object.getOwnPropertyDescriptor(document, 'elementFromPoint');
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
  try {
    let settle!: () => void;
    const pending = new Promise<void>((resolve) => {
      settle = resolve;
    });
    const onOpenChange = vi.fn();
    render(
      <FormDialog
        variant="drawer"
        side="right"
        title="Edit quota"
        defaultOpen
        onOpenChange={onOpenChange}
        onSubmit={() => pending}
      >
        <Input name="name" aria-label="Quota name" />
      </FormDialog>,
    );
    const popup = await screen.findByRole('dialog', { name: 'Edit quota' });
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => popup });
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('aria-busy', 'true');
    swipePastThreshold(popup, 1000);
    expect(screen.getByRole('dialog', { name: 'Edit quota' })).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();

    await act(async () => settle());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  } finally {
    vi.restoreAllMocks();
    if (hitTest) Object.defineProperty(document, 'elementFromPoint', hitTest);
    else Reflect.deleteProperty(document, 'elementFromPoint');
  }
});
