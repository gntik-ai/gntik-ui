import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { usePortalContainer } from '../../utils/portal';

export interface UseFileDialogOptions {
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
  capture?: 'user' | 'environment';
  disabled?: boolean;
  onChange?: (files: File[]) => void;
}

/** An attached, unnamed picker. SSR renders nothing; cancelling preserves the last selection. */
export function useFileDialog({
  accept,
  multiple = false,
  directory = false,
  capture,
  disabled = false,
  onChange,
}: UseFileDialogOptions = {}) {
  const container = usePortalContainer();
  const input = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const receive = useEffectEvent((event: Event) => {
    const selected = Array.from((event.currentTarget as HTMLInputElement).files ?? []);
    if (disabled || selected.length === 0) return;
    setFiles(selected);
    onChange?.(selected);
  });
  useEffect(() => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.hidden = true;
    picker.tabIndex = -1;
    const change = (event: Event) => receive(event);
    picker.addEventListener('change', change);
    (container ?? document.body).append(picker);
    input.current = picker;
    return () => {
      picker.removeEventListener('change', change);
      picker.remove();
      input.current = null;
    };
  }, [container]);
  useEffect(() => {
    const picker = input.current;
    if (!picker) return;
    picker.accept = accept ?? '';
    picker.multiple = multiple;
    picker.disabled = disabled;
    picker.toggleAttribute('webkitdirectory', directory);
    if (capture) picker.setAttribute('capture', capture);
    else picker.removeAttribute('capture');
  }, [accept, multiple, directory, capture, disabled, container]);
  return {
    files,
    open(event?: { currentTarget: EventTarget | null }) {
      const picker = input.current;
      if (disabled || !picker) return;
      const source = event?.currentTarget ?? picker.ownerDocument.activeElement;
      // A body-mounted picker is an outside press for non-modal overlays. Keep it
      // outside the control/block, but inside the activating dialog's surface.
      const surface = source instanceof Element ? source.closest('[role="dialog"], [role="alertdialog"]') : null;
      (surface ?? container ?? picker.ownerDocument.body).append(picker);
      picker.value = '';
      picker.click();
    },
    reset() {
      if (input.current) input.current.value = '';
      setFiles([]);
    },
  };
}
