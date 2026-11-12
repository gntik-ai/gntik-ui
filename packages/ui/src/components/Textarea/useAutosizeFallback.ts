import { useLayoutEffect } from 'react';

function resizeTextarea(
  control: HTMLTextAreaElement,
  minRows: number | undefined,
  maxRows: number | undefined,
  size: string | undefined,
) {
  const originalHeight = control.style.height;
  const originalOverflow = control.style.overflowY;
  const computed = getComputedStyle(control);
  const pixels = (value: string) => Number.parseFloat(value) || 0;
  const lineHeight = pixels(computed.lineHeight) || (size === 'sm' ? 20 : 24);
  const padding = pixels(computed.paddingTop) + pixels(computed.paddingBottom);
  const border = pixels(computed.borderTopWidth) + pixels(computed.borderBottomWidth);
  const minimum = pixels(computed.minHeight) || (minRows === undefined ? 88 : minRows * lineHeight + padding + border);
  const maximum =
    pixels(computed.maxHeight) || (maxRows === undefined ? Infinity : maxRows * lineHeight + padding + border);
  const caretAtEnd = control.selectionStart === control.value.length && control.selectionEnd === control.value.length;

  // Reset before measuring so deleting content can shrink a previously tall field.
  control.style.height = '0px';
  control.style.overflowY = 'hidden';
  const contentHeight = control.scrollHeight + border;
  const height = Math.max(minimum, Math.min(contentHeight, maximum));
  const measuredHeight = `${height}px`;
  control.style.height = measuredHeight;
  const overflow = contentHeight > height ? 'auto' : 'hidden';
  control.style.overflowY = overflow;
  if (caretAtEnd) control.scrollTop = control.scrollHeight;

  return () => {
    if (control.style.height === measuredHeight) control.style.height = originalHeight;
    if (control.style.overflowY === overflow) control.style.overflowY = originalOverflow;
  };
}

/** Native field-sizing needs no script to size; it only needs the capped field kept at its end. */
function scrollToEnd(control: HTMLTextAreaElement) {
  const caretAtEnd = control.selectionStart === control.value.length && control.selectionEnd === control.value.length;
  if (caretAtEnd && control.scrollHeight > control.clientHeight) control.scrollTop = control.scrollHeight;
}

/** Native field-sizing needs no script; measure only after a client commit. */
export function useAutosizeFallback(
  control: HTMLTextAreaElement | null,
  autosize: boolean | undefined,
  value: string,
  minRows: number | undefined,
  maxRows: number | undefined,
  size: string | undefined,
) {
  useLayoutEffect(() => {
    if (!autosize || !control) return;
    // The browser keeps only the caret line visible, leaving the bottom padding out of view.
    if (globalThis.CSS?.supports?.('field-sizing', 'content')) {
      scrollToEnd(control);
      return;
    }

    return resizeTextarea(control, minRows, maxRows, size);
  }, [control, autosize, value, minRows, maxRows, size]);
}
