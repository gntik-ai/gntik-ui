import { useLayoutEffect, useRef } from 'react';
import { sliderMarkVariants } from './slider.variants';

export type SliderMark = number | { value: number; label?: string };
export type LabelledMark = { value: number; label?: string };

export function normalizeMarks(marks: SliderMark[] | undefined, min: number, max: number): LabelledMark[] {
  return [
    ...new Map(
      (marks ?? [])
        .map((mark) => (typeof mark === 'number' ? { value: mark } : mark))
        .filter((mark) => Number.isFinite(mark.value) && mark.value >= min && mark.value <= max)
        .map((mark) => [mark.value, mark] as const),
    ).values(),
  ].sort((a, b) => a.value - b.value);
}

export function SliderMarkLabels({
  marks,
  values,
  min,
  max,
}: {
  marks: LabelledMark[];
  values: readonly number[];
  min: number;
  max: number;
}) {
  const row = useRef<HTMLDivElement>(null);
  const styles = sliderMarkVariants();
  const labels = marks.filter((mark) => mark.label !== undefined);
  useLayoutEffect(() => {
    const element = row.current;
    const track = element?.parentElement;
    if (!element || !track) return;
    const measure = () => {
      const width = track.getBoundingClientRect().width;
      if (!width) return;
      // Logical offsets inherit the root's computed direction, including a plain
      // dir ancestor or direction supplied by the consumer's stylesheet.
      element.style.direction = getComputedStyle(track.parentElement ?? track).direction;
      for (const child of element.children) {
        if (!(child instanceof HTMLElement)) continue;
        const labelWidth = child.getBoundingClientRect().width;
        const fraction = Number(child.dataset.position);
        const tick = width * fraction;
        child.style.insetInlineStart = `${Math.max(0, Math.min(tick - labelWidth / 2, width - labelWidth))}px`;
        child.style.insetInlineEnd = 'auto';
        child.style.transform = 'none';
        child.style.translate = 'none';
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    for (const child of element.children) observer.observe(child);
    return () => observer.disconnect();
  }, [marks, min, max]);
  return (
    <div ref={row} aria-hidden="true" className={styles.markLabels()}>
      {labels.map((mark, index) => {
        const position = (mark.value - min) / (max - min);
        const edge = index === 0 ? 'start' : index === labels.length - 1 ? 'end' : 'middle';
        return (
          <span
            key={mark.value}
            data-position={position}
            className={styles.markLabel({ active: values.includes(mark.value), edge })}
            style={
              edge === 'end' ? { insetInlineEnd: 0 } : { insetInlineStart: edge === 'start' ? 0 : `${position * 100}%` }
            }
          >
            {mark.label}
          </span>
        );
      })}
    </div>
  );
}
