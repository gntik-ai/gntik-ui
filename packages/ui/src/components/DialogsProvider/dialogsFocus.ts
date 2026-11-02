/** Focus facts recorded when a dialog call is made. */
export interface CapturedFocus {
  /** Element focused when the call was made. */
  opener: HTMLElement | null;
  /** Trigger of the menu that `opener` belongs to, resolved before the menu item unmounts. */
  fallback: HTMLElement | null;
}

const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"]';

function menuTriggerOf(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement = element;
  // A submenu trigger is itself an item of the parent menu, so walk up to the root trigger.
  for (let depth = 0; depth < 8; depth++) {
    const menu = current.closest<HTMLElement>('[role="menu"]');
    if (!menu) return current === element ? null : current;
    const labelledBy = menu.getAttribute('aria-labelledby');
    const trigger =
      (labelledBy ? document.getElementById(labelledBy) : null) ??
      document.querySelector<HTMLElement>(
        `[aria-controls="${CSS.escape(menu.id)}"], [aria-haspopup="menu"][aria-expanded="true"]`,
      );
    if (!trigger) return null;
    current = trigger;
  }
  return null;
}

/** Records the focused element, and the trigger of the menu it sits in, at call time. */
export function captureFocus(): CapturedFocus {
  const active = document.activeElement;
  const opener = active instanceof HTMLElement && active !== document.body ? active : null;
  return { opener, fallback: opener ? menuTriggerOf(opener) : null };
}

const usable = (element: HTMLElement | null | undefined): element is HTMLElement => !!element && element.isConnected;

const insideDialog = (element: Element) => element.closest(DIALOG_SELECTOR) !== null;

/** The most recently opened modal surface, ignoring non-modal notification toasts. */
function topmostDialog(): HTMLElement | null {
  const all = Array.from(document.querySelectorAll<HTMLElement>(DIALOG_SELECTOR));
  return all.filter((el) => !el.closest('[role="region"]')).at(-1) ?? null;
}

export interface FocusEntry {
  opener: HTMLElement | null;
  fallback: HTMLElement | null;
  returnFocus: HTMLElement | null | undefined;
}

/**
 * Where focus goes after `entry` was removed. While other dialogs remain, focus stays in (or moves
 * into) the topmost one; once the stack is empty it goes to `returnFocus`, the opener, the menu
 * trigger, and finally the opener of the first dialog of the stack.
 */
export function resolveFinalFocus(
  entry: FocusEntry,
  remaining: number,
  root: CapturedFocus | null,
): HTMLElement | boolean | null {
  if (remaining > 0) {
    const active = document.activeElement;
    if (active && active !== document.body && insideDialog(active)) return false;
    if (usable(entry.opener) && insideDialog(entry.opener)) return entry.opener;
    return topmostDialog() ?? false;
  }
  const candidates = [entry.returnFocus, entry.opener, entry.fallback, root?.opener, root?.fallback];
  return candidates.find(usable) ?? null;
}
