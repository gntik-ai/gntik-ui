import { useEffect, useState, type RefObject } from 'react';

/**
 * How many leading items fit in `container`, measuring an off-screen copy in `measure` whose
 * last child is the "+N" trigger template. `undefined` until measured (or when disabled).
 */
export function useFitCount(enabled: boolean, container: RefObject<HTMLElement | null>, measure: RefObject<HTMLElement | null>, count: number) {
  const [fit, setFit] = useState<number | undefined>(undefined);

  useEffect(() => {
    const box = container.current;
    const layer = measure.current;
    if (!enabled || !box || !layer || typeof ResizeObserver === 'undefined') return;

    const compute = () => {
      const kids = Array.from(layer.children) as HTMLElement[];
      const trigger = kids.pop();
      const available = box.clientWidth;
      const rects = kids.map((k) => k.getBoundingClientRect());
      const first = rects[0];
      const second = rects[1];
      const triggerWidth = trigger?.getBoundingClientRect().width ?? 0;
      if (!first) return setFit(0);
      const ltr = getComputedStyle(layer).direction !== 'rtl';
      const spacing = second ? (ltr ? second.left - first.right : first.left - second.right) : 0;
      const extent = (n: number) => {
        const last = rects[n - 1];
        if (!last) return 0;
        return ltr ? last.right - first.left : first.right - last.left;
      };
      let n = rects.length;
      if (extent(n) > available) {
        n = rects.length - 1;
        while (n > 0 && extent(n) + spacing + triggerWidth > available) n--;
      }
      setFit(n);
    };

    const observer = new ResizeObserver(compute);
    observer.observe(box);
    return () => observer.disconnect();
  }, [enabled, container, measure, count]);

  return enabled ? fit : undefined;
}
