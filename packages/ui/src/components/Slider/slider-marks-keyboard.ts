import type { ChangeEvent, ComponentProps, KeyboardEvent } from 'react';

/** Select a mark without crossing neighbours; distance is counted in mark indices. */
export function snapToMarks(
  values: readonly number[],
  thumbIndex: number,
  proposal: number,
  marks: readonly number[],
  minStepsBetweenValues: number,
) {
  const previous = values[thumbIndex - 1];
  const following = values[thumbIndex + 1];
  const previousIndex = marks.reduce(
    (last, mark, index) => (previous !== undefined && mark <= previous ? index : last),
    -1,
  );
  const followingIndex = marks.findIndex((mark) => following !== undefined && mark >= following);
  const gap = Math.max(0, minStepsBetweenValues);
  const candidates = marks.filter(
    (mark, index) =>
      (previous === undefined || (mark >= previous && index >= previousIndex + gap)) &&
      (following === undefined ||
        (mark <= following && index <= (followingIndex < 0 ? marks.length : followingIndex) - gap)),
  );
  const nearest = candidates.reduce<number | undefined>(
    (best, mark) => (best === undefined || Math.abs(mark - proposal) < Math.abs(best - proposal) ? mark : best),
    undefined,
  );
  return values.map((value, index) => (index === thumbIndex ? (nearest ?? value) : value));
}

export function markKeyDown(
  event: KeyboardEvent<HTMLInputElement>,
  inputChange: ComponentProps<'input'>['onChange'],
  values: readonly number[],
  index: number,
  marks: readonly number[],
  gap: number,
  dispatch: (change: () => void) => void,
) {
  if (event.defaultPrevented || event.currentTarget.disabled || !marks.length) return false;
  const current = values[index];
  if (current === undefined) return false;
  const input = event.currentTarget;
  const rtl =
    getComputedStyle(input).direction === 'rtl' ||
    (getComputedStyle(input).direction === '' && input.closest('[dir]')?.getAttribute('dir') === 'rtl');
  let proposal: number | undefined;
  switch (event.key) {
    case 'Home':
      proposal = marks[0];
      break;
    case 'End':
      proposal = marks[marks.length - 1];
      break;
    case 'ArrowRight':
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'ArrowDown':
    case 'PageUp':
    case 'PageDown': {
      const forward =
        event.key === 'ArrowUp' || event.key === 'PageUp' || event.key === (rtl ? 'ArrowLeft' : 'ArrowRight');
      proposal = forward ? marks.find((mark) => mark > current) : [...marks].reverse().find((mark) => mark < current);
      break;
    }
    default:
      return false;
  }
  event.preventDefault();
  event.stopPropagation();
  if (proposal === undefined) return true;
  const next = snapToMarks(values, index, proposal, marks, gap)[index];
  if (next === undefined || next === current) return true;

  // Thumb's public render children expose Base UI's native input handler. Reuse it
  // with the original keyboard event so Base UI creates its own change/commit
  // details, including the Field-resolved name and keyboard reason.
  try {
    dispatch(() => {
      input.value = String(next);
      inputChange?.(event as unknown as ChangeEvent<HTMLInputElement>);
    });
  } finally {
    // Restore React's rendered value after cancellation or a controlled proposal.
    // Accepted uncontrolled updates render their new value at the end of the event.
    input.value = input.getAttribute('value') ?? String(current);
  }
  return true;
}
